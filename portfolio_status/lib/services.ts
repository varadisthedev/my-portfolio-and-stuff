export interface Service {
    name: string;
    url?: string | undefined;
}

export const SERVICES: Service[] = [
    {
        name: "peafowl: chat app",
        url: process.env.PEAFOWL_CHATAPP_HEALTH_URL,
    },
    {
        name: "wall8",
        url: process.env.WALL8_HEALTH_URL,
    },
    {
        name: "live legal",
        url: process.env.LIVE_LEGAL_HEALTH_URL,
    },
    {
        name: "rentigo",
        url: process.env.RENTIGO_HEALTH_URL,
    },
    {
        name: "stuma",
        url: process.env.STUMA_HEALTH_URL,
    },
    {
        name: "taskflow",
        url: process.env.TASKFLOW_HEALTH_URL,
    },
    {
        name: "breezy",
        url: process.env.BREEZY_HEALTH_URL,
    },
];
