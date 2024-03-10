import { DataShow } from "@modules/dataShow/dataShow";
import { SearchLine } from "@modules/searchLine/searchLine";
import { Sidebar } from "@modules/sidebar/sidebar";
import "./App.scss";
import { LoginForm } from "@modules/login/login";

function App() {
  return (
    <div className="App">
      <Sidebar></Sidebar>
      <div className="main-app">
        <SearchLine></SearchLine>
        <DataShow></DataShow>
      </div>
      <LoginForm></LoginForm>
    </div>
  );
}

export default App;
