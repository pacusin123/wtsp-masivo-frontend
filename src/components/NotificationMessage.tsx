// src/components/NotificationMessage.tsx
import React, { useEffect, useState } from "react";
import "../css/NotificationMessage.css";

interface Props {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number; // en milisegundos
    onClose?: () => void;
}

const NotificationMessage: React.FC<Props> = ({ message, type = "success", duration = 2000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
        <div className="notification-wrapper">
            <div className={`notification-message ${type}`}>
                {message}
            </div>
        </div>
    );
};

export default NotificationMessage;
