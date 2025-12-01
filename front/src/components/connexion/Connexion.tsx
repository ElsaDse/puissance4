import { useState } from "react";
import Input from "./Input";
import "./../../style/connexion.css"

export default function Connexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Connexion :", { username, password });
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
              value={username}
              label="User:"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="login-input-group">
            <Input
              type="password"
              placeholder="••••••"
              value={password}
              label="Mot de Passe:"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">
            Se connecter
          </button>
        </form>

        <div className="divider">ou</div>

        <button className="guest-btn" onClick={handleGuest}>
          Continuer en tant qu’invité
        </button>
      </div>
    </div>
  );
}
