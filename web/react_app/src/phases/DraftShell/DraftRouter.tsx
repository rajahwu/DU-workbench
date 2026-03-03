import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

// DraftRouter is the index route for /04_draft.
// On mount it immediately navigates to the first stage.
// Nothing renders — it's a traffic director.

export default function DraftRouter() {
    const navigate = useNavigate();
    const location = useLocation();
    const didRedirect = useRef(false);
    
    useEffect(() => {
        if (didRedirect.current) return;
        if (location.pathname === "/draft") {
            didRedirect.current = true;
            navigate("/draft/approach", { replace: true });
        }
    }, [location.pathname, navigate]);

    return null;
}
