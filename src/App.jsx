import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  CircleHelp,
  Filter,
  Landmark,
  Loader2,
  Send,
  TimerReset,
  XCircle,
} from 'lucide-react'
import data from './properties.json'
import './App.css'

const tenants = [
  'Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Lucknow',
]

const statusColors = {
  Approved: '#198754',
  Pending: '#b7791f',
  Rejected: '#dc3545',
}

const cityColors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd', '#17becf', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22']

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value)

function buildSummary(records) {
  const byCity = tenants.map((tenant) => {
    const cityRows = records.filter((item) => item.tenant === tenant)
    const approved = cityRows.filter((item) => item.status === 'Approved').length
    const rejected = cityRows.filter((item) => item.status === 'Rejected').length
    const pending = cityRows.filter((item) => item.status === 'Pending').length
    const collection = cityRows.reduce((sum, item) => sum + item.collection_inr, 0)
    const annualDemand = cityRows.reduce((sum, item) => sum + item.annual_tax_inr, 0)

    return {
      tenant,
      total: cityRows.length,
      approved,
      rejected,
      pending,
      collection,
      annualDemand,
      approvalRate: cityRows.length ? (approved / cityRows.length) * 100 : 0,
    }
  })

  const totals = byCity.reduce(
    (acc, city) => ({
      total: acc.total + city.total,
      approved: acc.approved + city.approved,
      rejected: acc.rejected + city.rejected,
      pending: acc.pending + city.pending,
      collection: acc.collection + city.collection,
      annualDemand: acc.annualDemand + city.annualDemand,
    }),
    { total: 0, approved: 0, rejected: 0, pending: 0, collection: 0, annualDemand: 0 },
  )

  return {
    byCity,
    totals,
    topCollector: byCity.reduce((best, city) => (city.collection > best.collection ? city : best), byCity[0]),
    mostPending: byCity.reduce((best, city) => (city.pending > best.pending ? city : best), byCity[0]),
  }
}

function answerFromAnalytics(question, summary) {
  const query = question.toLowerCase()
  const mentionedCities = tenants.filter((city) => query.includes(city.toLowerCase()))
  const getCity = (city) => summary.byCity.find((item) => item.tenant === city)

  if (query.includes('highest') && query.includes('collection')) {
    return `${summary.topCollector.tenant} has the highest total collection at ${formatCurrency(summary.topCollector.collection)}.`
  }

  if (query.includes('most') && query.includes('pending')) {
    return `${summary.mostPending.tenant} has the most pending properties, with ${formatNumber(summary.mostPending.pending)} pending registrations.`
  }

  if (query.includes('compare') && mentionedCities.length >= 2) {
    return mentionedCities
      .slice(0, 2)
      .map((city) => {
        const item = getCity(city)
        return `${city}: ${formatNumber(item.total)} registrations and ${formatCurrency(item.collection)} collected`
      })
      .join('. ')
  }

  if (mentionedCities.length) {
    const city = getCity(mentionedCities[0])
    if (query.includes('rejected')) {
      return `${city.tenant} has ${formatNumber(city.rejected)} rejected properties.`
    }
    if (query.includes('approved') && (query.includes('percentage') || query.includes('percent') || query.includes('%'))) {
      return `${city.approvalRate.toFixed(1)}% of ${city.tenant} properties are approved (${formatNumber(city.approved)} of ${formatNumber(city.total)}).`
    }
    if (query.includes('approved')) {
      return `${city.tenant} has ${formatNumber(city.approved)} approved properties.`
    }
    if (query.includes('collection')) {
      return `${city.tenant}'s total collection is ${formatCurrency(city.collection)}.`
    }
    if (query.includes('registration') || query.includes('properties')) {
      return `${city.tenant} has ${formatNumber(city.total)} registered properties.`
    }
  }

  return `Across all cities there are ${formatNumber(summary.totals.total)} registered properties, ${formatNumber(summary.totals.approved)} approved, ${formatNumber(summary.totals.rejected)} rejected, and ${formatCurrency(summary.totals.collection)} collected. ${summary.topCollector.tenant} is the top collector.`
}

function App() {
  const [selectedTenant, setSelectedTenant] = useState('All Cities')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask me about collections, approvals, rejected properties, pending counts, or city comparisons.',
    },
  ])
  const [question, setQuestion] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const summary = useMemo(() => buildSummary(data), [])
  const filteredRows = useMemo(
    () => (selectedTenant === 'All Cities' ? data : data.filter((item) => item.tenant === selectedTenant)),
    [selectedTenant],
  )

  const kpis = useMemo(() => {
    const approved = filteredRows.filter((item) => item.status === 'Approved').length
    const rejected = filteredRows.filter((item) => item.status === 'Rejected').length
    const collection = filteredRows.reduce((sum, item) => sum + item.collection_inr, 0)

    return [
      {
        label: 'Total Properties Registered',
        value: formatNumber(filteredRows.length),
        icon: Building2,
        tone: 'blue',
      },
      {
        label: 'Total Properties Approved',
        value: formatNumber(approved),
        icon: CheckCircle2,
        tone: 'green',
      },
      {
        label: 'Total Properties Rejected',
        value: formatNumber(rejected),
        icon: XCircle,
        tone: 'red',
      },
      {
        label: 'Total Collection',
        value: formatCurrency(collection),
        icon: BadgeIndianRupee,
        tone: 'gold',
      },
    ]
  }, [filteredRows])

  const propertyMix = useMemo(() => {
    const counts = filteredRows.reduce((acc, item) => {
      acc[item.property_type] = (acc[item.property_type] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredRows])

  const recentRows = useMemo(
    () =>
      [...filteredRows]
        .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
        .slice(0, 8),
    [filteredRows],
  )

  async function askAssistant(event) {
    event.preventDefault()
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isThinking) return

    const nextMessages = [...messages, { role: 'user', text: trimmedQuestion }]
    setMessages(nextMessages)
    setQuestion('')
    setIsThinking(true)

    const localAnswer = answerFromAnalytics(trimmedQuestion, summary)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
      setMessages([...nextMessages, { role: 'assistant', text: localAnswer }])
      setIsThinking(false)
      return
    }

    try {
      const prompt = `You are an analytics assistant for the UPYOG property tax dashboard. Answer briefly and only from this summary.\n\nSummary JSON:\n${JSON.stringify(summary, null, 2)}\n\nQuestion: ${trimmedQuestion}`
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
          }),
        },
      )

      if (!response.ok) throw new Error('Gemini request failed')

      const result = await response.json()
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      setMessages([...nextMessages, { role: 'assistant', text: aiText || localAnswer }])
    } catch {
      setMessages([...nextMessages, { role: 'assistant', text: `${localAnswer} Gemini was unavailable, so I answered from the local dashboard summary.` }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">NUDM Intern Assessment 2026</p>
          <h1>UPYOG Property Tax Analytics</h1>
          <p className="subtitle">Multi-tenant dashboard for 1,000 property records across 10 Indian cities.</p>
        </div>
        <label className="tenant-filter">
          <Filter size={18} aria-hidden="true" />
          <span>Tenant</span>
          <select value={selectedTenant} onChange={(event) => setSelectedTenant(event.target.value)}>
            <option>All Cities</option>
            {tenants.map((tenant) => (
              <option key={tenant}>{tenant}</option>
            ))}
          </select>
        </label>
      </header>

      <section className="kpi-grid" aria-label="Key performance indicators">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <article className={`kpi-card ${kpi.tone}`} key={kpi.label}>
              <div className="kpi-icon">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                <p>{kpi.label}</p>
                <strong>{kpi.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="insight-strip" aria-label="Dashboard highlights">
        <div>
          <Landmark size={18} aria-hidden="true" />
          <span>Top collector</span>
          <strong>{summary.topCollector.tenant}</strong>
          <small>{formatCurrency(summary.topCollector.collection)}</small>
        </div>
        <div>
          <TimerReset size={18} aria-hidden="true" />
          <span>Most pending</span>
          <strong>{summary.mostPending.tenant}</strong>
          <small>{formatNumber(summary.mostPending.pending)} properties</small>
        </div>
        <div>
          <CircleHelp size={18} aria-hidden="true" />
          <span>Current view</span>
          <strong>{selectedTenant}</strong>
          <small>{formatNumber(filteredRows.length)} records</small>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Comparison chart</p>
              <h2>Total collection by city</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={summary.byCity} margin={{ top: 8, right: 16, left: 12, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tenant" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={58} />
              <YAxis tickFormatter={(value) => `${Math.round(value / 100000)}L`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="collection" name="Collection">
                {summary.byCity.map((city, index) => (
                  <Cell key={city.tenant} fill={cityColors[index % cityColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Bonus view</p>
              <h2>Status by city</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={summary.byCity} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tenant" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={62} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" name="Approved" stackId="status" fill={statusColors.Approved} />
              <Bar dataKey="pending" name="Pending" stackId="status" fill={statusColors.Pending} />
              <Bar dataKey="rejected" name="Rejected" stackId="status" fill={statusColors.Rejected} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chat-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">AI assistant</p>
              <h2>Ask the data</h2>
            </div>
          </div>
          <div className="chat-log" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
            {isThinking && (
              <div className="message assistant thinking">
                <Loader2 size={16} aria-hidden="true" />
                Thinking...
              </div>
            )}
          </div>
          <form className="chat-form" onSubmit={askAssistant}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Which city has the highest total collection?"
              aria-label="Ask a question about property tax data"
            />
            <button type="submit" disabled={isThinking || !question.trim()} aria-label="Send question">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Selected tenant</p>
              <h2>Property mix</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={propertyMix} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3}>
                {propertyMix.map((slice, index) => (
                  <Cell key={slice.name} fill={cityColors[index + 2]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel table-panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Latest records</p>
              <h2>Recent registrations</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Property ID</th>
                  <th>Tenant</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Collection</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => (
                  <tr key={row.property_id}>
                    <td>{row.property_id}</td>
                    <td>{row.tenant}</td>
                    <td>{row.owner_name}</td>
                    <td>
                      <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
                    </td>
                    <td>{formatCurrency(row.collection_inr)}</td>
                    <td>{row.registration_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
