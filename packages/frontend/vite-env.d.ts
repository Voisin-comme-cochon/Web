/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_VCC_MAPBOX_PUBLIC_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}