package user

import (
	"context"
	"log"
	"strings"

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
	_, err := uc.repo.GetUserByEmail(ctx, user.Email)
	if err == nil {
		log.Println("GetUserByEmail: user already exists:", err)
		return user, cleveruser.ErrUserAlreadyExists
	}
	user.ID = uuid.New().String()
	user.Bucket = strings.Split(user.Email, "@")[0]

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
		log.Println("GetUserBySession: session not found")
		return cleveruser.User{}, cleveruser.ErrSessionNotFound
	}
	return user, nil
}

func (uc *Usecase) GetUserByID(ctx context.Context, userID string) (cleveruser.User, error) {
	return uc.repo.GetUserByID(ctx, userID)
}

func (uc *Usecase) Login(ctx context.Context, authUser cleveruser.User) (string, error) {
	user, err := uc.repo.GetUserByEmail(ctx, authUser.Email)
	if err != nil {
		log.Println("Login: GetUserByEmail repo error:", err)
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(authUser.Password))
	if err != nil {
		log.Println("Login: CompareHashAndPassword error:", err)
		return "", cleveruser.ErrWrongCredentials
	}

	sessionID := uuid.New().String()
	uc.userSessions[sessionID] = user

	return sessionID, nil
}

func (uc *Usecase) Logout(ctx context.Context, sessionID string) error {
	_, ok := uc.userSessions[sessionID]
	if !ok {
		log.Println("Logout: session not found")
		return cleveruser.ErrSessionNotFound
	}
	delete(uc.userSessions, sessionID)
	return nil
}

func (uc *Usecase) GetUserByEmail(ctx context.Context, email string) (cleveruser.User, error) {
	return uc.repo.GetUserByEmail(ctx, email)
}
