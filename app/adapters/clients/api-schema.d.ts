// Gerado por `npm run api:types` a partir do OpenAPI da API. Nao edite.

export interface paths {
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Estado da API e do banco de dados */
        get: operations["get_health_api_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/readings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Leituras do periodo, da mais recente para a mais antiga */
        get: operations["list_readings_api_readings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/readings/series": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Serie de temperaturas por pirometro no periodo (maximo 31 dias) */
        get: operations["get_series_api_readings_series_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pyrometers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pirometros existentes, com o complemento */
        get: operations["list_pyrometers_api_pyrometers_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pyrometers/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ultima leitura com temperatura de cada pirometro e ha quantos minutos */
        get: operations["list_summaries_api_pyrometers_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pyrometers/{pyrometer_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Grava o complemento de um pirometro existente */
        put: operations["save_pyrometer_api_pyrometers__pyrometer_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Api
             * @constant
             */
            api: "up";
            /**
             * Database
             * @enum {string}
             */
            database: "up" | "down";
        };
        /**
         * PyrometerProfileRequest
         * @description O complemento inteiro: o que nao vier volta ao padrao (sem apelido, cor padrao, ativo).
         */
        PyrometerProfileRequest: {
            /** Nickname */
            nickname?: string | null;
            /** Color */
            color?: string | null;
            /** Note */
            note?: string | null;
            /**
             * Active
             * @default true
             */
            active: boolean;
        };
        /** PyrometerResponse */
        PyrometerResponse: {
            /** Id */
            id: string;
            /** Name */
            name: string | null;
            /** Nickname */
            nickname: string | null;
            /** Color */
            color: string;
            /** Note */
            note: string | null;
            /** Active */
            active: boolean;
        };
        /** PyrometerSeriesResponse */
        PyrometerSeriesResponse: {
            /** Pyrometer Id */
            pyrometer_id: string | null;
            /** Pyrometer Name */
            pyrometer_name: string | null;
            /** Points */
            points: components["schemas"]["SeriesPointResponse"][];
        };
        /** PyrometerSummaryResponse */
        PyrometerSummaryResponse: {
            /** Pyrometer Id */
            pyrometer_id: string;
            /** Temperature */
            temperature: number;
            /**
             * Measured At
             * Format: date-time
             */
            measured_at: string;
            /** Battery */
            battery: number | null;
            /** Minutes Without Reading */
            minutes_without_reading: number;
        };
        /** ReadingResponse */
        ReadingResponse: {
            /** Id */
            id: number;
            /** Gateway Id */
            gateway_id: string | null;
            /** Gateway Name */
            gateway_name: string | null;
            /** Pyrometer Id */
            pyrometer_id: string | null;
            /** Pyrometer Name */
            pyrometer_name: string | null;
            /** Measured At */
            measured_at: string | null;
            /** Thermocouple */
            thermocouple: string | null;
            /** Unit */
            unit: string | null;
            /** Cold Junction */
            cold_junction: number | null;
            /** Read Delay */
            read_delay: number | null;
            /** Place */
            place: number | null;
            /** Battery */
            battery: number | null;
            /** Temperature */
            temperature: number | null;
            /** Detect Time */
            detect_time: number | null;
        };
        /** ReadingsPageResponse */
        ReadingsPageResponse: {
            /** Items */
            items: components["schemas"]["ReadingResponse"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Page Size */
            page_size: number;
        };
        /** SeriesPointResponse */
        SeriesPointResponse: {
            /** Id */
            id: number;
            /** Measured At */
            measured_at: string | null;
            /** Temperature */
            temperature: number | null;
            /** Place */
            place: number | null;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_health_api_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    list_readings_api_readings_get: {
        parameters: {
            query: {
                /** @description Inicio do periodo, horario local sem fuso */
                start: string;
                /** @description Fim do periodo, horario local sem fuso */
                end: string;
                /** @description Serial do pirometro (repetivel) */
                dev_id?: string[] | null;
                page?: number;
                page_size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadingsPageResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_series_api_readings_series_get: {
        parameters: {
            query: {
                /** @description Inicio do periodo, horario local sem fuso */
                start: string;
                /** @description Fim do periodo, horario local sem fuso */
                end: string;
                /** @description Serial do pirometro (repetivel) */
                dev_id?: string[] | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PyrometerSeriesResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_pyrometers_api_pyrometers_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PyrometerResponse"][];
                };
            };
        };
    };
    list_summaries_api_pyrometers_summary_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PyrometerSummaryResponse"][];
                };
            };
        };
    };
    save_pyrometer_api_pyrometers__pyrometer_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pyrometer_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PyrometerProfileRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PyrometerResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
