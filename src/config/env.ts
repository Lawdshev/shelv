import { config } from "dotenv";
config();

const os = Object.assign({}, process.env);

export default {
  name: os.APP_NAME || "Shelv",
  logo: process.env.APP_LOGO || "",
  domain: {
    user: {
      api: os.APP_DOMAIN_API || "http://localhost:3000",
      web: {
        dev: os.APP_DOMAIN_WEB_DEV || "http://localhost:3000",
        stage: os.APP_DOMAIN_WEB_STAGE || "",
      },
    },
  },
  services: {
    google: {
      calendar: {
        clientId:
          os.GOOGLE_CALENDAR_CLIENT_ID ||
          "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        clientSecret:
          os.GOOGLE_CALENDAR_CLIENT_SECRET ||
          "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        redirectUrl:
          os.GOOGLE_CALENDAR_REDIRECT_URL ||
          "http://localhost:8002/api/v1/auth/google/callback",
        credentials: os.GOOGLE_CALENDAR_CREDENTIALS || "{}",
      },
    },
    sms: {
      termii: {
        api: os.TERMII_API || "https://api.ng.termii.com/api",
        key: os.TERMII_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    },
    event: {
      kafka: {
        cluster: os.KAFKA_CLUSTER || "localhost:9092",
        clientId: os.KAFKA_CLIENT_ID || "my-app",
        username: os.KAFKA_USERNAME || "admin",
        password: os.KAFKA_PASSWORD || "password",
      },
    },
    payment: {
      flutterwave: {
        live: {
          publicKey: process.env.FLUTTERWAVE_LIVE_PUBLIC_KEY || "xxxxxx",
          secretKey: process.env.FLUTTERWAVE_LIVE_SECRET_KEY || "xxxxxx",
          encryptionKey:
            process.env.FLUTTERWAVE_LIVE_ENCRYPTION_KEY || "xxxxxx",
          secretHash: process.env.FLUTTERWAVE_LIVE_SECRET_HASH || "xxxxxx",
        },
        test: {
          publicKey: process.env.FLUTTERWAVE_TEST_PUBLIC_KEY || "xxxxxx",
          secretKey: process.env.FLUTTERWAVE_TEST_SECRET_KEY || "xxxxxx",
          encryptionKey:
            process.env.FLUTTERWAVE_TEST_ENCRYPTION_KEY || "xxxxxx",
          secretHash: process.env.FLUTTERWAVE_TEST_SECRET_HASH || "xxxxxx",
        },
        v3: {
          url:
            process.env.FLUTTERWAVE_V3_URL || "https://api.flutterwave.com/v3",
        },
      },
    },
    mail: {
      mailjet: {
        host: os.MAIL_HOST || "smtp.mailtrap.io",
        port: Number(os.MAIL_PORT) || 2525,
        secure: os.MAIL_SECURE === "true" || false,
        auth: {
          user: os.MAIL_USER || "user",
          pass: os.MAIL_PASSWORD || "password",
        },
        url:
          os.MAIL_WEBHOOK_URL ||
          "https://accountableuserservice.onrender.com/v1/email/mailjet/webhook",
        apiKeyId: os.MAIL_API_KEY_ID || "2344403",
        replyToEmail:
          os.MAIL_REPLY_TO_EMAIL || "9PSX-as7uW1n2tYZ@parse-in1.mailjet.com",
        parserId: os.MAIL_PARSER_ROUTE_ID,
      },
      joinder: os.MAIL_JOINEDER || "keychronicmarbles",
      from: os.MAIL_FROM || "engineering@opensaucery.africa",
      reply: os.MAIL_REPLY || "9PSX-as7uW1n2tYZ@parse-in1.mailjet.com",
      name: os.MAIL_NAME || "Accountable",
      template: {
        passwordReset: {
          subject: `Let's recover your password | Accountable`,
          html: `<p>Hello {{firstName}},</p><p>As requested, Please click on the link below to reset your password.</p><p>{{link}}</p><p>This link will expire in 5 minutes.</p>`,
        },
        passwordAlert: {
          subject: `Accountable Password Change alert`,
          html: `<p>Hello {{firstName}},</p><p>Your password was recently changed at {{time}} from IP address {{ip}}.</p><p>If this was you, you can ignore this email.</p><p>If this wasn't you, please reset your password immediately.</p>`,
        },
        accountActivation: {
          subject: `Verify your email address | Accountable`,
          html: `<p>Hello {{firstName}},</p><p>As a part of your account completion process. Please click on the link below to verify your email.</p><p>{{link}}</p><p>This link will expire in 5 minutes.</p>`,
        },
        signinAlert: {
          subject: `Account Sign-in alert`,
          html: `<p>Hello {{firstName}},</p><p>There was a new sign-in to your account at {{time}} from IP address {{ip}}.</p><p>If this was you, you can ignore this email.</p><p>If this wasn't you, please reset your password immediately.</p>`,
        },
        newMessageAlert: {
          subject: `Accountable Message Alert`,
          html: `<p>Hello {{firstName}},</p><p>{{senderFirstname}} {{senderLastname}} sent you a message</p></b><p>{{text}}</p></b></b><footer><p>Reply directly via this email or log on to your Accountable dashboard to respond.</p></footer></b>`,
        },
        referralAlert: {
          subject: `Accountable Referral Alert`,
          html: `<p>Hello {{referee}},</p></b><p>{{referrerFirstName}} {{referrerLastName}} has invited you to come enjoy a better accounting experience on Accountable.</p></b><p>Please use the link below to begin your registration.</p><p>{{link}}</p>`,
          htmlWithNote: `<p>Hello {{referee}},</p></b><p>{{referrerFirstName}} {{referrerLastName}} has invited you to come enjoy a better accounting experience on Accountable.</p></b><p>They also left the following note:</p><p>{{note}}</p><p>Please use the link below to begin your registration.</p><p>{{link}}</p>`,
        },
        stamentUpload: {
          subject: `Accountable Statement Upload`,
          html: `<p>Hello {{manager}},</p></b><p>{{userFirstName}}{{userLastName}} uploaded bank statments. Attached are statements</p>`,
        },
      },
    },
    monehq: {
      live: {
        v1: process.env.MONEHQ_URL || "https://api.moneyhq.io/api/v1",
        signature:
          os.MONEHQ_SIGNATURE || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
      test: {
        v1: process.env.MONEHQ_URL || "https://dev-api.moneyhq.io/api/v1",
        signature:
          os.MONEHQ_SIGNATURE || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    },
    accounts: {
      OKRA: {
        url: process.env.OKRA_BASE_URL || "https://api.okra.ng/v2/sandbox",
        apiKey: process.env.OKRA_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        clientToken:
          process.env.OKRA_CLIENT_TOKEN || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        secretKey:
          process.env.OKRA_SECRET_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
      MONO: {
        url: process.env.MONO_BASE_URL || "https://api.withmono.com/v1",
        secretKey:
          process.env.MONO_SECRET_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        publicKey:
          process.env.MONO_PUBLIC_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    },
  },
  jwt: {
    secret: os.APP_SECRET || "jsyk@whoknows.later",
    expiry: os.JWT_EXPIRY || "1d",
  },
  port: Number(os.PORT) || 8000,
  cursor: {
    step: 50, // step for factory ids
    current: 0, // current factory id
    pointer: 0, // index in current
  },
  deploymentEnv: os.DEPLOYMENT_ENV || "development",
  database: {
    mongodb: {
      host: os.DB_HOST || "localhost",
      port: Number(os.DB_PORT) || 27017,
      name: os.DB_NAME || "shelv",
      user: os.DB_USER || "",
      password: os.DB_PASSWORD || "",
      uri: `mongodb+srv://${os.DB_USER}:${os.DB_PASSWORD}@${os.DB_HOST}/?retryWrites=true&w=majority`,
    },
    redis: {
      port: Number(os.REDIS_PORT) || 6379,
      host: os.REDIS_HOST || "xxxx",
      username: os.REDIS_USERNAME || "localhost",
      password: os.REDIS_PASSWORD || "password",
    },
  },
  encryption: {
    key: os.ENCRYPTION_KEY || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    iv: os.ENCRYPTION_IV || "xxxxxxxxxxxxxxxx",
    algorithm: os.ENCRYPTION_ALGORITHM || "aes-256-cbc",
  },
//   people: {
//     // people with manager role but some admin permissions
//     AdminManager: {
//       Ann: os.ANN_EMAIL || "nidhi-ann@accountable.global",
//       Fred: os.FRED_EMAIL || "product@accountable.global",
//     },
//   },
//   trialBalanceSheetName: "TBal",
};
