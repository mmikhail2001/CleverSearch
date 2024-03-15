package user

import (
	"context"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/google/uuid"
)

type Usecase struct {
	repo         Repository
	userSessions map[string]cleveruser.User
}

func NewUsecase(repo Repository) *Usecase {
	return &Usecase{
		repo:         repo,
		userSessions: make(map[string]cleveruser.User),
	}
}

func (uc *Usecase) Register(ctx context.Context, user cleveruser.User) (cleveruser.User, error) {
	user.ID = uuid.New().String()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("GenerateFromPassword error:", err)
		return user, err
	}
	user.Password = string(hashedPassword)

	user, err = uc.repo.CreateUser(ctx, user)
	if err != nil {
		log.Println("CreateUser repo error:", err)
		return user, err
	}
	return user, nil
}

func (uc *Usecase) GetUserBySession(ctx context.Context, sessionID string) (cleveruser.User, error) {
	user, ok := uc.userSessions[sessionID]
	if !ok {
		log.Println("GetUserBySession not found")
		return cleveruser.User{}, fmt.Errorf("user by session not found")
	}
	return user, nil
}

func (uc *Usecase) Login(ctx context.Context, authUser cleveruser.User) (string, error) {
	user, err := uc.repo.GetUserByEmail(ctx, authUser.Email)
	if err != nil {
		log.Println("GetUserByEmail repo error:", err)
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(authUser.Password))
	if err != nil {
		log.Println("CompareHashAndPassword error:", err)
		return "", err
	}

	sessionID := uuid.New().String()
	uc.userSessions[sessionID] = user

	return sessionID, nil
}

func (uc *Usecase) Logout(ctx context.Context, sessionID string) error {
	_, ok := uc.userSessions[sessionID]
	if !ok {
		log.Println("Logout: session not found")
		return fmt.Errorf("user by session not found")
	}
	delete(uc.userSessions, sessionID)
	return nil
}
