import 'dotenv/config'

import { z } from 'zod'

const schema = z.object({
    BOT_TOKEN: z.string(),
    CHANNEL_ID: z.string(),
    NODE_ENV: z.string().optional(),
    SMEE_URI: z.string().url().optional(),
    HOST_URL: z.string().url(),
    PORT: z.string().transform((val) => Number(val)),
})

export const env = schema.parse(process.env)
