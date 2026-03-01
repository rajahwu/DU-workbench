import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// DraftRouter is the index route for /04_draft.
// On mount it immediately navigates to the first stage.
// Nothing renders — it's a traffic director.

export default function DraftRouter() {
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.pathname.endsWith('/draft')) {
            navigate('/draft/approach', { replace: true });
        } 

    }, [navigate]);

    return null;
}
