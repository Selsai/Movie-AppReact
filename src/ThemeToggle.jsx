// ThemeToggle.jsx
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowUp } from "lucide-react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("cinema-theme");
        return savedTheme ? savedTheme : "dark";
    });
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        // Appliquer le thème au chargement
        document.documentElement.setAttribute("data-cinema-theme", theme);
        document.body.classList.remove("cinema-theme-dark", "cinema-theme-light");
        document.body.classList.add(
            theme === "dark" ? "cinema-theme-dark" : "cinema-theme-light"
        );
        localStorage.setItem("cinema-theme", theme);
    }, [theme]);

    useEffect(() => {
        // Gestion du scroll pour la flèche
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
            <button
                className="cinema-theme-toggle"
                onClick={toggleTheme}
                aria-label={`Basculer en mode ${theme === "light" ? "cinéma" : "plein air"}`}
            >
                {theme === "light" ? (
                    <Moon className="cinema-icon" />
                ) : (
                    <Sun className="pleinair-icon" />
                )}
            </button>

            <button
                className={`back-to-top ${showBackToTop ? "visible" : ""}`}
                onClick={scrollToTop}
                aria-label="Retour en haut de page"
            >
                <ArrowUp />
            </button>
        </>
    );
};

export default ThemeToggle;
