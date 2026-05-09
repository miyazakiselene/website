"use client"

import { useState } from "react"
import { Mail, User, Phone, MessageSquare, Send, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatedSection } from "@/components/animated-section"
import Image from "next/image"

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <section id="contact" className="py-24 md:py-32 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scaleIn" className="max-w-2xl mx-auto">
            <Card className="bg-background border-border">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  送信完了
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                  お問い合わせありがとうございます。
                  <br />
                  担当者より折り返しご連絡いたします。
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" size="lg" className="hover:scale-105 transition-transform text-lg px-8">
                  新しいお問い合わせ
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80"
          alt="Basketball"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16" animation="fadeInUp">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mt-3 mb-6">
            お問い合わせ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            入部や練習試合のお申し込み、その他ご質問などお気軽にお問い合わせください。
          </p>
        </AnimatedSection>

        {/* Contact Form */}
        <AnimatedSection className="max-w-2xl mx-auto" animation="fadeInUp" delay={200}>
          <Card className="bg-background border-border hover:border-primary/30 transition-colors duration-300">
            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Inquiry Type */}
                <AnimatedSection animation="fadeInLeft" delay={300}>
                  <div className="space-y-3">
                    <Label htmlFor="inquiry-type" className="text-base font-semibold">お問い合わせ種別</Label>
                    <Select required>
                      <SelectTrigger id="inquiry-type" className="bg-input hover:border-primary/50 transition-colors h-12 text-base">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="join" className="text-base">入部について</SelectItem>
                        <SelectItem value="practice-match" className="text-base">
                          練習試合のお申し込み
                        </SelectItem>
                        <SelectItem value="other" className="text-base">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AnimatedSection>

                {/* Name */}
                <AnimatedSection animation="fadeInLeft" delay={350}>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold">お名前</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="山田 太郎"
                        className="pl-12 bg-input hover:border-primary/50 focus:border-primary transition-colors h-12 text-base"
                        required
                      />
                    </div>
                  </div>
                </AnimatedSection>

                {/* Email */}
                <AnimatedSection animation="fadeInLeft" delay={400}>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold">メールアドレス</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        className="pl-12 bg-input hover:border-primary/50 focus:border-primary transition-colors h-12 text-base"
                        required
                      />
                    </div>
                  </div>
                </AnimatedSection>

                {/* Phone */}
                <AnimatedSection animation="fadeInLeft" delay={450}>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold">電話番号（任意）</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="090-1234-5678"
                        className="pl-12 bg-input hover:border-primary/50 focus:border-primary transition-colors h-12 text-base"
                      />
                    </div>
                  </div>
                </AnimatedSection>

                {/* Message */}
                <AnimatedSection animation="fadeInLeft" delay={500}>
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-semibold">お問い合わせ内容</Label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Textarea
                        id="message"
                        placeholder="お問い合わせ内容をご記入ください"
                        className="pl-12 bg-input min-h-[140px] hover:border-primary/50 focus:border-primary transition-colors text-base"
                        required
                      />
                    </div>
                  </div>
                </AnimatedSection>

                {/* Submit Button */}
                <AnimatedSection animation="fadeInUp" delay={550}>
                  <Button 
                    type="submit" 
                    className="w-full group hover:scale-[1.02] transition-all duration-300 text-lg h-14" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        送信する
                      </>
                    )}
                  </Button>
                </AnimatedSection>

                <p className="text-base text-muted-foreground text-center">
                  ※ 通常2〜3営業日以内にご返信いたします
                </p>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  )
}
