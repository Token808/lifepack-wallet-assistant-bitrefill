import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { WalletDashboard } from './wallet-dashboard'

describe('WalletDashboard', () => {
  it('renders the LifePack Token UI wallet assistant', () => {
    const html = renderToString(
      <MemoryRouter>
        <WalletDashboard />
      </MemoryRouter>,
    )

    expect(html).toContain('LifePack Wallet Assistant')
    expect(html).toContain('TokenCore 钱包资产')
    expect(html).toContain('Bitrefill 订单卡')
    expect(html).toContain('USDC')
  })
})
