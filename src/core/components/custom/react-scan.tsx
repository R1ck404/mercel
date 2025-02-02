'use client'

import { scan } from "react-scan";
import { useEffect } from "react";
export const ReactScan = () => {
    useEffect(() => {
        scan({
            enabled: false,
            // trackUnnecessaryRenders: true,
            // dangerouslyForceRunInProduction: true,
            // log: true,
        });
    }, []);
    return null;
};