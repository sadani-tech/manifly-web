export const v14EnhancementsEnabled =
  process.env.NEXT_PUBLIC_V14_ENHANCEMENTS !== "false";

export const v2Flags = {
  financialNavigation: process.env.NEXT_PUBLIC_NAV_FINANCIAL_GROUP !== "false",
  help: process.env.NEXT_PUBLIC_HELP_CENTER !== "false",
  feedback: process.env.NEXT_PUBLIC_FEEDBACK !== "false",
  whatsappBanner: process.env.NEXT_PUBLIC_WA_CONNECT_BANNER !== "false",
} as const;
