import { AssetRow } from '@repo/ui/components/asset-row'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import { ChatBubble } from '@repo/ui/components/chat-bubble'
import { Input } from '@repo/ui/components/input'
import { StepCard, type StepState } from '@repo/ui/components/step-card'
import { toast } from '@repo/ui/components/toast'
import { type FormEvent, useMemo, useState } from 'react'

type ScenarioKey = 'travel' | 'shopping' | 'gift'
type PaymentStatus = 'ready' | 'signing' | 'tracking' | 'delivering' | 'delivered'
type ChatRole = 'assistant' | 'user'

interface Scenario {
  prompt: string
  title: string
  products: string
  region: string
  price: string
  answer: string
  cards: Array<[string, string]>
  code: string
}

interface ChatMessage {
  role: ChatRole
  text: string
}

const scenarios: Record<ScenarioKey, Scenario> = {
  travel: {
    prompt: 'I am going to Japan for 5 days. Help me prepare internet and payment.',
    title: 'Japan Travel Pack',
    products: 'Japan eSIM 7 days + Digital Prepaid Visa',
    region: 'Japan',
    price: '$55.00',
    answer:
      'Japan Travel Pack is ready. The assistant recommends a 7-day Japan eSIM and a Digital Prepaid Visa for travel internet and online payments. USDC is recommended because your balance is stable and sufficient.',
    cards: [
      ['Japan eSIM 7 days', 'Digital delivery for short-term travel internet.'],
      ['Digital Prepaid Visa', 'Useful for online payments with region and merchant reminders.'],
      ['USDC payment', 'Stable value and enough balance for this order.'],
    ],
    code: 'ESIM-JP7-LIFE-4829 - VISA-50-REFILL-9201',
  },
  shopping: {
    prompt: 'I need a virtual card for online shopping.',
    title: 'Online Shopping Pack',
    products: 'Digital Prepaid Visa + Amazon Gift Card',
    region: 'Global / US',
    price: '$75.00',
    answer:
      'Online Shopping Pack is ready. The assistant recommends a Digital Prepaid Visa and an Amazon gift card so wallet balance can turn into spendable digital commerce value.',
    cards: [
      ['Digital Prepaid Visa', 'For online payments with usage limits shown before checkout.'],
      ['Amazon Gift Card', 'A high-frequency e-commerce option for quick spending.'],
      ['USDT / USDC', 'Stablecoin payments make the real cost easier to understand.'],
    ],
    code: 'VISA-75-LIFE-3188 - AMAZON-25-REFILL-6402',
  },
  gift: {
    prompt: 'My friend likes games. I want to send a 30 USD gift.',
    title: 'Game Gift Pack',
    products: 'Steam Gift Card 30 USD + Gift Claim Page',
    region: 'US',
    price: '$30.00',
    answer:
      'Game Gift Pack is ready. The assistant recommends a Steam gift card and prepares a shareable claim flow for the receiver after payment.',
    cards: [
      ['Steam Gift Card', 'A strong gift option for gamers.'],
      ['Gift Claim Page', 'Can include a message and a claim status.'],
      ['Lightning payment', 'Fast small-value payment experience.'],
    ],
    code: 'STEAM-30-LIFE-7731 - CLAIM-LINK-READY',
  },
}

const assets = [
  { symbol: 'USDC', amount: '326.4 USDC', value: '$326.40', detail: 'Base / Polygon' },
  { symbol: 'USDT', amount: '198.1 USDT', value: '$198.10', detail: 'Tron / Ethereum' },
  { symbol: 'BTC', amount: '0.0015 BTC', value: '$156.70', detail: 'Bitcoin / Lightning' },
  { symbol: 'ETH', amount: '0.022 ETH', value: '$92.35', detail: 'Ethereum Mainnet' },
  { symbol: 'SOL', amount: '0.42 SOL', value: '$69.21', detail: 'Solana' },
]

const primaryPayments: Array<[string, string]> = [
  ['USDC', 'Stable balance'],
  ['Lightning', 'Fast small payment'],
  ['USDT', 'Popular stablecoin'],
  ['Solana', 'Backup payment'],
]

const morePayments: Array<[string, string]> = [
  ['Bitcoin', 'BTC mainnet'],
  ['Ethereum', 'ETH mainnet'],
  ['Binance Pay', 'Exchange quick pay'],
  ['Litecoin', 'Low-cost LTC'],
  ['Dogecoin', 'DOGE payment'],
  ['Dash', 'DASH payment'],
]

const sceneButtons: Array<[ScenarioKey, string, string]> = [
  ['travel', 'Travel Pack', 'eSIM + payment card + budget suggestion'],
  ['shopping', 'Shopping Pack', 'Visa / Mastercard / e-commerce gift card'],
  ['gift', 'Gift Pack', 'Steam / Apple / Google Play gift flow'],
]

const metricCards: Array<[string, string]> = [
  ['5,000+', 'Gift cards, payment cards, eSIMs, and mobile top-ups from global merchants.'],
  [
    '10 ways',
    'Bitcoin, Lightning, Ethereum, USDC, USDT, Binance Pay, Litecoin, Dogecoin, Solana, Dash.',
  ],
  ['Token UI', 'Built with official @repo/ui components for wallet and payment surfaces.'],
  ['Security', 'No private key display. Payment amount, chain, and order are confirmed first.'],
]

const tokenCoreAdapter = {
  connectWallet() {
    return { address: '0xTC0re...2048', status: 'connected' }
  },
  prepareInvoicePayment(pack: Scenario, asset: string) {
    return {
      asset,
      amount: pack.price,
      merchant: 'Bitrefill',
      orderId: 'LP-REFILL-2048',
    }
  },
  signPayment(asset: string) {
    return `tcx_mock_signature_${asset.toLowerCase().replace(/\s/g, '_')}`
  },
}

function CoinAvatar({ symbol }: { symbol: string }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-blue text-body-sm font-bold text-primary">
      {symbol.slice(0, 2)}
    </div>
  )
}

function Glyph({ children }: { children: string }) {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-caption font-bold text-primary">
      {children}
    </span>
  )
}

function inferScenario(text: string): ScenarioKey {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('japan') || lowerText.includes('travel') || lowerText.includes('esim')) {
    return 'travel'
  }
  if (lowerText.includes('gift') || lowerText.includes('friend') || lowerText.includes('game')) {
    return 'gift'
  }
  return 'shopping'
}

function stepState(status: PaymentStatus, step: number): StepState {
  if (step < 3) return 'completed'
  if (status === 'ready') return step === 3 ? 'active' : 'pending'
  if (status === 'signing') return step === 3 ? 'active' : 'pending'
  if (status === 'tracking') return step < 4 ? 'completed' : step === 4 ? 'active' : 'pending'
  if (status === 'delivering') return step < 5 ? 'completed' : 'active'
  return 'completed'
}

function WalletDashboard() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('travel')
  const [prompt, setPrompt] = useState(scenarios.travel.prompt)
  const [payment, setPayment] = useState('USDC')
  const [showMorePayments, setShowMorePayments] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('ready')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Tell me what you need. I will turn it into a Bitrefill order.' },
    { role: 'user', text: scenarios.travel.prompt },
    { role: 'assistant', text: scenarios.travel.answer },
  ])

  const scenario = scenarios[scenarioKey]

  const paymentLabel = useMemo(() => {
    if (paymentStatus === 'ready') return `TokenCore Sign & Pay with ${payment}`
    if (paymentStatus === 'signing') return 'TokenCore signing...'
    if (paymentStatus === 'tracking') return 'Tracking Bitrefill invoice...'
    if (paymentStatus === 'delivering') return 'Delivering code...'
    return 'Purchase Delivered by TokenCore'
  }, [payment, paymentStatus])

  const orderSteps: Array<[string, string, string]> = [
    ['1', 'Search Bitrefill products', 'Catalog matched'],
    ['2', 'Choose amount and region', 'Order composed'],
    ['3', 'TokenCore local signing', `${payment} payment request`],
    ['4', 'Track Bitrefill invoice', 'Invoice and chain confirmation'],
    ['5', 'Deliver digital item', 'Code or eSIM delivered'],
  ]

  const chooseScenario = (nextScenario: ScenarioKey) => {
    setScenarioKey(nextScenario)
    setPrompt(scenarios[nextScenario].prompt)
    setPaymentStatus('ready')
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: scenarios[nextScenario].prompt },
      { role: 'assistant', text: scenarios[nextScenario].answer },
    ])
  }

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed) return

    const nextScenario = inferScenario(trimmed)
    setScenarioKey(nextScenario)
    setPaymentStatus('ready')
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: scenarios[nextScenario].answer },
    ])
    setPrompt('')
  }

  const runPayment = () => {
    const wallet = tokenCoreAdapter.connectWallet()
    const invoice = tokenCoreAdapter.prepareInvoicePayment(scenario, payment)
    const signature = tokenCoreAdapter.signPayment(payment)

    setPaymentStatus('signing')
    toast.success(`TokenCore connected: ${wallet.address}`)

    window.setTimeout(() => {
      setPaymentStatus('tracking')
      toast.success(`Signed ${invoice.amount} with ${payment}`, {
        description: signature,
      })
    }, 850)

    window.setTimeout(() => {
      setPaymentStatus('delivering')
    }, 1750)

    window.setTimeout(() => {
      setPaymentStatus('delivered')
      toast.success('Bitrefill digital item delivered to wallet UI')
    }, 2650)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-surface-cool p-5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-title-sm font-bold text-primary-foreground">
            TC
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Token UI</Badge>
              <Badge variant="neutral">Bitrefill Agents</Badge>
              <Badge variant="success">Wallet Connected</Badge>
            </div>
            <h1 className="mt-3 text-title-lg font-bold tracking-tight">
              LifePack Wallet Assistant
            </h1>
          </div>
        </div>
        <div className="grid gap-2 text-body-sm text-muted-foreground sm:grid-cols-3">
          <span>TokenCore-compatible signer</span>
          <span>AI shopping assistant</span>
          <span>Gift cards / Payment cards / eSIM</span>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[310px_minmax(420px,1fr)_380px]">
        <Card className="min-h-[720px]" size="sm">
          <CardHeader>
            <CardTitle>TokenCore Wallet Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-body-sm text-muted-foreground">Spendable balance</div>
              <div className="mt-1 text-display-lg font-bold tracking-tight">$842.76</div>
              <div className="mt-2 text-body-sm text-muted-foreground">
                Stablecoin estimate / +2.4% this week
              </div>
            </div>

            <div className="space-y-2">
              {assets.map((asset) => (
                <AssetRow
                  key={asset.symbol}
                  avatar={<CoinAvatar symbol={asset.symbol} />}
                  symbol={asset.symbol}
                  amount={asset.amount}
                  value={asset.value}
                  detail={asset.detail}
                  className="bg-background"
                />
              ))}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="text-caption font-semibold uppercase text-muted-foreground">
                Life scenarios
              </div>
              {sceneButtons.map(([key, title, detail]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseScenario(key)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    scenarioKey === key
                      ? 'border-primary bg-primary-soft'
                      : 'border-border bg-background hover:bg-accent'
                  }`}
                >
                  <Glyph>{title.slice(0, 1)}</Glyph>
                  <span>
                    <span className="block text-body-sm font-bold">{title}</span>
                    <span className="block text-caption text-muted-foreground">{detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[720px]" size="sm">
          <CardHeader>
            <CardTitle>AI Commerce Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-[640px] flex-col gap-4">
            <div className="flex-1 space-y-4 overflow-hidden rounded-2xl border border-border bg-background p-4">
              {messages.slice(-6).map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.text}`}
                  className={message.role === 'user' ? 'ml-auto max-w-[82%]' : 'max-w-[88%]'}
                >
                  <ChatBubble variant={message.role === 'user' ? 'outgoing' : 'incoming'}>
                    {message.text}
                  </ChatBubble>
                </div>
              ))}

              <div className="grid gap-3 pt-2 md:grid-cols-3">
                {scenario.cards.map(([title, detail]) => (
                  <div key={title} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-body-sm font-bold">{title}</div>
                    <div className="mt-2 text-caption leading-relaxed text-muted-foreground">
                      {detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="flex gap-3" onSubmit={submitPrompt}>
              <Input
                aria-label="Enter shopping intent"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Tell the wallet what you need"
              />
              <Button type="submit" className="px-6">
                Go
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-h-[720px]" size="sm">
          <CardHeader>
            <CardTitle>Bitrefill Order Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-title-sm font-bold">{scenario.title}</div>
                  <div className="mt-1 text-caption text-muted-foreground">{scenario.products}</div>
                </div>
                <Badge variant="positive" size="lg">
                  {scenario.price}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 text-body-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-semibold">{scenario.region}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Wallet layer</span>
                  <span className="font-semibold">TokenCore / tcx-wasm Signer</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-semibold">LP-REFILL-2048</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-caption font-semibold uppercase text-muted-foreground">
                Recommended payment
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[...primaryPayments, ...(showMorePayments ? morePayments : [])].map(
                  ([name, detail]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setPayment(name)
                        setPaymentStatus('ready')
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        payment === name
                          ? 'border-primary bg-primary-soft'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      <span className="block text-body-sm font-bold">{name}</span>
                      <span className="mt-1 block text-caption text-muted-foreground">{detail}</span>
                    </button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMorePayments((value) => !value)}
              >
                {showMorePayments ? 'Hide more payment methods' : 'Show more payment methods'}
              </Button>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={runPayment}
              disabled={paymentStatus !== 'ready'}
            >
              {paymentLabel}
            </Button>

            <div className="grid gap-3">
              {orderSteps.map(([number, label, detail], index) => (
                <StepCard
                  key={label}
                  icon={<Glyph>{number}</Glyph>}
                  label={label}
                  detail={detail}
                  state={stepState(paymentStatus, index + 1)}
                />
              ))}
            </div>

            {paymentStatus === 'delivered' ? (
              <div className="rounded-2xl border border-success-border bg-success-surface-tint p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold">Delivered to wallet</div>
                  <Badge variant="success">Redeem Ready</Badge>
                </div>
                <div className="mt-3 rounded-xl border border-border bg-background p-3 font-mono text-caption leading-relaxed">
                  {scenario.code}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metricCards.map(([title, detail]) => (
          <Card key={title} size="sm">
            <CardContent className="pt-4">
              <div className="text-title-sm font-bold">{title}</div>
              <div className="mt-2 text-body-sm leading-relaxed text-muted-foreground">{detail}</div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export { WalletDashboard }
