import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { getPublicSiteBaseHref } from "@/lib/site-base"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  const siteUrl = new URL(getPublicSiteBaseHref())
  const ogImage = new URL("/images/team-gallery/team-05-group.png", siteUrl).toString()

  const canonical = locale === "ja" ? "/" : `/${locale}`

  return {
    title: {
      default: t("titleDefault"),
      template: `%s | ${t("siteNameTemplate")}`,
    },
    description: t("description"),
    alternates: {
      canonical,
      languages: {
        ja: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "ja_JP",
      url: locale === "ja" ? siteUrl.toString() : new URL(`/${locale}`, siteUrl).toString(),
      siteName: t("siteNameTemplate"),
      title: t("titleDefault"),
      description: t("description"),
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("titleDefault") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("titleDefault"),
      description: t("description"),
      images: [ogImage],
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
