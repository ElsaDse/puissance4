import { useState, type FormEvent } from "react";
import Input from "./Input";
import "./../../style/connexion.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Connexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    try {
      const res = await axios.post('http://localhost:4000/auth/login', { username, password });
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user)); // garde session
      navigate('/home');
    } catch (err) {
      console.error(err);
    }
    console.log("Connexion...");
  }

  async function handleGuest() {
    try {
      const res = await axios.post('http://localhost:4000/auth/guest', {});
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user)); // garde session
      navigate('/home');
    } catch (err) {
      console.error(err);
    }
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
