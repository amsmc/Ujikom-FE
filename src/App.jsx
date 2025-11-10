import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import LandingPage from "./pages/user/LandingPage";
import Register from "./pages/auth/Register";

function App() {
    useEffect(() => {
        AOS.init({
            duration: 1000, 
            once: true      
        });
    }, []);

    return (
    <div>
      {/* <LandingPage />
      <Register /> */}
    </div>
    );
}

export default App;
