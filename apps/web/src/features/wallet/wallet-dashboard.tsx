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

const scenarios: Record<ScenarioKey, Scenario> = {
  travel: {
    prompt: '我要去日本 5 天，帮我准备上网和支付',
    title: 'Japan Travel Pack',
    products: 'Japan eSIM 7 天 + Digital Prepaid Visa',
    region: 'Japan',
    price: '$55.00',
    answer:
      '已生成 Japan Travel Pack。推荐 Japan eSIM 7 天和 Digital Prepaid Visa，适合旅行上网和线上支付。根据你的余额，USDC 是本次最稳妥的付款方式。',
    cards: [
      ['Japan eSIM 7 天', '短途旅行上网，数字交付安装信息。'],
      ['Digital Prepaid Visa', '用于线上支付，购买前提示地区和商户限制。'],
      ['USDC 支付', '余额充足，金额稳定，适合本次订单。'],
    ],
    code: 'ESIM-JP7-LIFE-4829 · VISA-50-REFILL-9201',
  },
  shopping: {
    prompt: '我想买一个能网上付款的虚拟卡',
    title: 'Online Shopping Pack',
    products: 'Digital Prepaid Visa + Amazon Gift Card',
    region: 'Global / US',
    price: '$75.00',
    answer:
      '已生成 Online Shopping Pack。推荐 Digital Prepaid Visa 和 Amazon 礼品卡，让钱包余额直接变成可用于线上消费的数字商品。',
    cards: [
      ['Digital Prepaid Visa', '适合网上支付，先展示使用限制。'],
      ['Amazon Gift Card', '高频电商场景，适合快速消费。'],
      ['USDT / USDC', '稳定币支付更容易理解实际成本。'],
    ],
    code: 'VISA-75-LIFE-3188 · AMAZON-25-REFILL-6402',
  },
  gift: {
    prompt: '我朋友喜欢游戏，我想送他 30 美元礼物',
    title: 'Game Gift Pack',
    products: 'Steam Gift Card 30 USD + Gift Claim Page',
    region: 'US',
    price: '$30.00',
    answer:
      '已生成 Game Gift Pack。推荐 Steam 礼品卡，并为收礼人生成一个可分享领取页，付款后兑换码会进入礼物页面。',
    cards: [
      ['Steam Gift Card', '适合游戏玩家，礼品属性强。'],
      ['Gift Claim Page', '可加入祝福语和领取状态。'],
      ['Lightning 支付', '小额快速付款体验更顺滑。'],
    ],
    code: 'STEAM-30-LIFE-7731 · CLAIM-LINK-READY',
  },
}

const assets = [
  { symbol: 'USDC', amount: '326.4 USDC', value: '$326.40', detail: 'Base · Polygon' },
  { symbol: 'USDT', amount: '198.1 USDT', value: '$198.10', detail: 'Tron · Ethereum' },
  { symbol: 'BTC', amount: '0.0015 BTC', value: '$156.70', detail: 'Bitcoin · Lightning' },
  { symbol: 'ETH', amount: '0.022 ETH', value: '$92.35', detail: 'Ethereum Mainnet' },
  { symbol: 'SOL', amount: '0.42 SOL', value: '$69.21', detail: 'Solana' },
]

const primaryPayments = [
  ['USDC', '余额充足 · 稳定'],
  ['Lightning', '快速小额付款'],
  ['USDT', '常用稳定币'],
  ['Solana', '备用支付'],
]

const morePayments = [
  ['Bitcoin', 'BTC 主网支付'],
  ['Ethereum', 'ETH 主网支付'],
  ['Binance Pay', '交易所快捷支付'],
  ['Litecoin', 'LTC 低成本支付'],
  ['Dogecoin', 'DOGE 支付'],
  ['Dash', 'DASH 支付'],
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
  if (text.includes('日本') || text.includes('旅行') || lowerText.includes('esim')) {
    return 'travel'
  }
  if (
    text.includes('送') ||
    text.includes('朋友') ||
    text.includes('游戏') ||
    lowerText.includes('steam')
  ) {
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
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '你好，我可以把你的生活需求转换成 Bitrefill 商品订单。' },
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
          <span>Gift cards · Payment cards · eSIM</span>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[310px_minmax(420px,1fr)_380px]">
        <Card className="min-h-[720px]" size="sm">
          <CardHeader>
            <CardTitle>TokenCore 钱包资产</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-body-sm text-muted-foreground">可消费余额</div>
              <div className="mt-1 text-display-lg font-bold tracking-tight">$842.76</div>
              <div className="mt-2 text-body-sm text-muted-foreground">估算为稳定币价值 · +2.4% 本周</div>
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
              <div className="text-caption font-semibold uppercase text-muted-foreground">生活场景</div>
              {([
                ['travel', 'Travel Pack', 'eSIM + 支付卡 + 预算建议'],
                ['shopping', 'Shopping Pack', 'Visa / Mastercard / 电商礼品卡'],
                ['gift', 'Gift Pack', 'Steam / Apple / Google Play 分享送礼'],
              ] as Array<[ScenarioKey, string, string]>).map(([key, title, detail]) => (
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
            <CardTitle>AI 电商助手</CardTitle>
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
                    <div className="mt-2 text-caption leading-relaxed text-muted-foreground">{detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <form className="flex gap-3" onSubmit={submitPrompt}>
              <Input
                aria-label="输入生活需求"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="告诉钱包你想买什么"
              />
              <Button type="submit" className="px-6">
                Go
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-h-[720px]" size="sm">
          <CardHeader>
            <CardTitle>Bitrefill 订单卡</CardTitle>
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
                  <span className="text-muted-foreground">地区</span>
                  <span className="font-semibold">{scenario.region}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">钱包层</span>
                  <span className="font-semibold">TokenCore / tcx-wasm Signer</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">订单号</span>
                  <span className="font-semibold">LP-REFILL-2048</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-caption font-semibold uppercase text-muted-foreground">推荐支付</div>
              <div className="grid grid-cols-2 gap-2">
                {[...primaryPayments, ...(showMorePayments ? morePayments : [])].map(([name, detail]) => (
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
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMorePayments((value) => !value)}
              >
                {showMorePayments ? '收起更多支付方式' : '展开更多支付方式'}
              </Button>
            </div>

            <Button className="w-full" size="lg" onClick={runPayment} disabled={paymentStatus !== 'ready'}>
              {paymentLabel}
            </Button>

            <div className="grid gap-3">
              {[
                ['1', '搜索 Bitrefill 商品', 'Catalog matched'],
                ['2', '选择面额和地区', 'Order composed'],
                ['3', 'TokenCore 本地签名付款', `${payment} payment request`],
                ['4', 'Bitrefill 发票追踪', 'Invoice and chain confirmation'],
                ['5', '数字商品交付', 'Code or eSIM delivered'],
              ].map(([number, label, detail], index) => (
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
                  <div className="font-bold">已交付到钱包</div>
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
        {[
          ['5,000+', '全球商户礼品卡、支付卡、eSIM 和充值商品。'],
          ['10 ways', 'Bitcoin、Lightning、Ethereum、USDC、USDT、Binance Pay、Litecoin、Dogecoin、Solana、Dash。'],
          ['Token UI', '使用官方 @repo/ui 组件构建钱包、支付确认和订单状态界面。'],
          ['Security', '不展示私钥，付款前明确确认金额、链和订单。'],
        ].map(([title, detail]) => (
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
