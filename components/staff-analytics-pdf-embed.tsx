import Link from "next/link"
import { FileDown, ExternalLink, FileType } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PDF_PATH = "/reports/website-analytics-vercel.pdf"

export function StaffAnalyticsPdfEmbed() {
  return (
    <Card className="mb-10 border-border overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <FileType className="h-5 w-5 text-primary" />
          website – Analytics – Vercel（PDF）
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          共有いただいた PDF と同一のファイルです。ブラウザ内表示が難しい場合は「新しいタブで開く」からご覧ください。
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={PDF_PATH} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              新しいタブで開く
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={PDF_PATH} download>
              <FileDown className="h-4 w-4" />
              ダウンロード
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-0">
        <iframe
          title="website – Analytics – Vercel PDF"
          src={PDF_PATH}
          className="h-[min(85vh,920px)] w-full border-0 bg-muted/20"
        />
      </CardContent>
    </Card>
  )
}
