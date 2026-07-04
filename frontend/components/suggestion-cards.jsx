'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Leaf } from 'lucide-react'

export function SuggestionCards({ onSuggestionClick }) {
  const suggestions = [
    {
      id: 1,
      title: 'Get ESG Report',
      description: 'Generate a comprehensive ESG assessment',
      icon: Leaf,
      prompt: 'Generate a comprehensive ESG report analyzing environmental, social, and governance factors for sustainable business practices.',
    },
    {
      id: 2,
      title: 'Financial Analysis',
      description: 'Analyze financial metrics & performance',
      icon: TrendingUp,
      prompt: 'Provide a detailed financial analysis including key metrics, profitability trends, liquidity analysis, and financial health indicators.',
    },
    {
      id: 3,
      title: 'Sustainability Insights',
      description: 'Explore sustainability opportunities',
      icon: BarChart3,
      prompt: 'Analyze sustainability opportunities, carbon footprint reduction strategies, and ESG compliance initiatives.',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon
        return (
          <Card
            key={suggestion.id}
            className="p-9 cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-all group border-border bg-card"
          >
            <Button
              variant="ghost"
              className="w-full h-full justify-start flex-col items-start gap-3 p-0"
              onClick={() => onSuggestionClick(suggestion.prompt)}
            >
              <Icon className="w-6 h-6 text-accent group-hover:text-primary transition-colors" />
              <div className="text-left">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {suggestion.title}
                </h3>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </div>
            </Button>
          </Card>
        )
      })}
    </div>
  )
}
