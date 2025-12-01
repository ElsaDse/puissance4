import { useState } from "react";
import Input from "./Input";
import "./../../style/connexion.css"

export default function Connexion() {
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Connexion :", { name, pwd });
  }

  function handleGuest() {
    console.log("Connexion en invité");
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Connexion</h1>

        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <Input
              type="text"
              placeholder="name"
              value={name}
              label="User:"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="login-input-group">
            <Input
              type="password"
              placeholder="••••••"
              value={pwd}
              label="Mot de Passe:"
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">
            Se connecter
          </button>
        </form>

        <div className="divider">ou</div>

        <button className="guest-btn" onClick={handleGuest}>
          Se connecter en tant qu’invité
        </button>
      </div>
    </div>
  );
}
