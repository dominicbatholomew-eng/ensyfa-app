import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [memberSearch, setMemberSearch] = useState('')
  const [contributionSearch, setContributionSearch] = useState('')
  const [contributionTypeFilter, setContributionTypeFilter] = useState('')
  const [loanSearch, setLoanSearch] = useState('')
  const [loanStatusFilter, setLoanStatusFilter] = useState('')

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [loginMessage, setLoginMessage] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    gender: '',
    occupation: '',
    share_capital: '',
    monthly_contribution: '',
  })

  const [contributionData, setContributionData] = useState({
    member_id: '',
    amount: '',
    payment_date: '',
    payment_type: '',
    note: '',
  })

  const [loanData, setLoanData] = useState({
    member_id: '',
    amount_requested: '',
    reason: '',
    status: 'Pending',
    request_date: '',
    approval_date: '',
    note: '',
  })

  const [announcementData, setAnnouncementData] = useState({
    title: '',
    message: '',
    audience: '',
    posted_by: '',
    posted_date: '',
  })

  const [message, setMessage] = useState('')
  const [contributionMessage, setContributionMessage] = useState('')
  const [loanMessage, setLoanMessage] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')

  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loanRequests, setLoanRequests] = useState([])
  const [announcements, setAnnouncements] = useState([])

  const [editingId, setEditingId] = useState(null)
  const [editingContributionId, setEditingContributionId] = useState(null)
  const [editingLoanId, setEditingLoanId] = useState(null)
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchMembers()
      fetchContributions()
      fetchLoanRequests()
      fetchAnnouncements()
    }
  }, [session])

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    })

    if (error) {
      setLoginMessage('Login error: ' + error.message)
    } else {
      setLoginMessage('Login successful!')
      setLoginData({
        email: '',
        password: '',
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setLoginMessage('Logged out successfully!')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContributionChange = (e) => {
    const { name, value } = e.target
    setContributionData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoanChange = (e) => {
    const { name, value } = e.target
    setLoanData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAnnouncementChange = (e) => {
    const { name, value } = e.target
    setAnnouncementData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage('Error loading members: ' + error.message)
    } else {
      setMembers(data || [])
    }
  }

  const fetchContributions = async () => {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setContributionMessage('Error loading contributions: ' + error.message)
    } else {
      setContributions(data || [])
    }
  }

  const fetchLoanRequests = async () => {
    const { data, error } = await supabase
      .from('loan_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setLoanMessage('Error loading loan requests: ' + error.message)
    } else {
      setLoanRequests(data || [])
    }
  }

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setAnnouncementMessage('Error loading announcements: ' + error.message)
    } else {
      setAnnouncements(data || [])
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      gender: '',
      occupation: '',
      share_capital: '',
      monthly_contribution: '',
    })
    setEditingId(null)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingId) {
      setMessage('Updating member...')

      const { error } = await supabase
        .from('members')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          gender: formData.gender,
          occupation: formData.occupation,
          share_capital: formData.share_capital ? Number(formData.share_capital) : null,
          monthly_contribution: formData.monthly_contribution
            ? Number(formData.monthly_contribution)
            : null,
        })
        .eq('id', editingId)

      if (error) {
        setMessage('Error updating member: ' + error.message)
      } else {
        setMessage('Member updated successfully!')
        resetForm()
        fetchMembers()
      }
    } else {
      setMessage('Saving member...')

      const { error } = await supabase.from('members').insert([
        {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          gender: formData.gender,
          occupation: formData.occupation,
          share_capital: formData.share_capital ? Number(formData.share_capital) : null,
          monthly_contribution: formData.monthly_contribution
            ? Number(formData.monthly_contribution)
            : null,
        },
      ])

      if (error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('Member registered successfully!')
        resetForm()
        fetchMembers()
      }
    }
  }

  const handleEdit = (member) => {
    setEditingId(member.id)
    setFormData({
      full_name: member.full_name || '',
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      gender: member.gender || '',
      occupation: member.occupation || '',
      share_capital: member.share_capital || '',
      monthly_contribution: member.monthly_contribution || '',
    })
    setMessage('Editing member...')
    setActiveSection('members')
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?')
    if (!confirmDelete) return

    const { error } = await supabase.from('members').delete().eq('id', id)

    if (error) {
      setMessage('Error deleting member: ' + error.message)
    } else {
      setMessage('Member deleted successfully!')
      fetchMembers()
    }
  }

  const handleContributionSubmit = async (e) => {
    e.preventDefault()

    if (editingContributionId) {
      setContributionMessage('Updating contribution...')

      const { error } = await supabase
        .from('contributions')
        .update({
          member_id: contributionData.member_id,
          amount: contributionData.amount ? Number(contributionData.amount) : null,
          payment_date: contributionData.payment_date || null,
          payment_type: contributionData.payment_type,
          note: contributionData.note,
        })
        .eq('id', editingContributionId)

      if (error) {
        setContributionMessage('Error updating contribution: ' + error.message)
      } else {
        setContributionMessage('Contribution updated successfully!')
        setContributionData({
          member_id: '',
          amount: '',
          payment_date: '',
          payment_type: '',
          note: '',
        })
        setEditingContributionId(null)
        fetchContributions()
      }
    } else {
      setContributionMessage('Saving contribution...')

      const { error } = await supabase.from('contributions').insert([
        {
          member_id: contributionData.member_id,
          amount: contributionData.amount ? Number(contributionData.amount) : null,
          payment_date: contributionData.payment_date || null,
          payment_type: contributionData.payment_type,
          note: contributionData.note,
        },
      ])

      if (error) {
        setContributionMessage('Error saving contribution: ' + error.message)
      } else {
        setContributionMessage('Contribution saved successfully!')
        setContributionData({
          member_id: '',
          amount: '',
          payment_date: '',
          payment_type: '',
          note: '',
        })
        setEditingContributionId(null)
        fetchContributions()
      }
    }
  }

  const handleContributionEdit = (item) => {
    setEditingContributionId(item.id)
    setContributionData({
      member_id: item.member_id || '',
      amount: item.amount || '',
      payment_date: item.payment_date || '',
      payment_type: item.payment_type || '',
      note: item.note || '',
    })
    setContributionMessage('Editing contribution...')
    setActiveSection('contributions')
  }

  const handleContributionDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this contribution?')
    if (!confirmDelete) return

    const { error } = await supabase.from('contributions').delete().eq('id', id)

    if (error) {
      setContributionMessage('Error deleting contribution: ' + error.message)
    } else {
      setContributionMessage('Contribution deleted successfully!')
      fetchContributions()
    }
  }

  const handleLoanSubmit = async (e) => {
    e.preventDefault()

    if (editingLoanId) {
      setLoanMessage('Updating loan request...')

      const { error } = await supabase
        .from('loan_requests')
        .update({
          member_id: loanData.member_id,
          amount_requested: loanData.amount_requested
            ? Number(loanData.amount_requested)
            : null,
          reason: loanData.reason,
          status: loanData.status,
          request_date: loanData.request_date || null,
          approval_date: loanData.approval_date || null,
          note: loanData.note,
        })
        .eq('id', editingLoanId)

      if (error) {
        setLoanMessage('Error updating loan request: ' + error.message)
      } else {
        setLoanMessage('Loan request updated successfully!')
        setLoanData({
          member_id: '',
          amount_requested: '',
          reason: '',
          status: 'Pending',
          request_date: '',
          approval_date: '',
          note: '',
        })
        setEditingLoanId(null)
        fetchLoanRequests()
      }
    } else {
      setLoanMessage('Saving loan request...')

      const { error } = await supabase.from('loan_requests').insert([
        {
          member_id: loanData.member_id,
          amount_requested: loanData.amount_requested
            ? Number(loanData.amount_requested)
            : null,
          reason: loanData.reason,
          status: loanData.status,
          request_date: loanData.request_date || null,
          approval_date: loanData.approval_date || null,
          note: loanData.note,
        },
      ])

      if (error) {
        setLoanMessage('Error saving loan request: ' + error.message)
      } else {
        setLoanMessage('Loan request saved successfully!')
        setLoanData({
          member_id: '',
          amount_requested: '',
          reason: '',
          status: 'Pending',
          request_date: '',
          approval_date: '',
          note: '',
        })
        setEditingLoanId(null)
        fetchLoanRequests()
      }
    }
  }

  const handleLoanEdit = (loan) => {
    setEditingLoanId(loan.id)
    setLoanData({
      member_id: loan.member_id || '',
      amount_requested: loan.amount_requested || '',
      reason: loan.reason || '',
      status: loan.status || 'Pending',
      request_date: loan.request_date || '',
      approval_date: loan.approval_date || '',
      note: loan.note || '',
    })
    setLoanMessage('Editing loan request...')
    setActiveSection('loans')
  }

  const handleLoanDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this loan request?')
    if (!confirmDelete) return

    const { error } = await supabase.from('loan_requests').delete().eq('id', id)

    if (error) {
      setLoanMessage('Error deleting loan request: ' + error.message)
    } else {
      setLoanMessage('Loan request deleted successfully!')
      fetchLoanRequests()
    }
  }

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault()

    if (editingAnnouncementId) {
      setAnnouncementMessage('Updating announcement...')

      const { error } = await supabase
        .from('announcements')
        .update({
          title: announcementData.title,
          message: announcementData.message,
          audience: announcementData.audience,
          posted_by: announcementData.posted_by,
          posted_date: announcementData.posted_date || null,
        })
        .eq('id', editingAnnouncementId)

      if (error) {
        setAnnouncementMessage('Error updating announcement: ' + error.message)
      } else {
        setAnnouncementMessage('Announcement updated successfully!')
        setAnnouncementData({
          title: '',
          message: '',
          audience: '',
          posted_by: '',
          posted_date: '',
        })
        setEditingAnnouncementId(null)
        fetchAnnouncements()
      }
    } else {
      setAnnouncementMessage('Saving announcement...')

      const { error } = await supabase.from('announcements').insert([
        {
          title: announcementData.title,
          message: announcementData.message,
          audience: announcementData.audience,
          posted_by: announcementData.posted_by,
          posted_date: announcementData.posted_date || null,
        },
      ])

      if (error) {
        setAnnouncementMessage('Error saving announcement: ' + error.message)
      } else {
        setAnnouncementMessage('Announcement saved successfully!')
        setAnnouncementData({
          title: '',
          message: '',
          audience: '',
          posted_by: '',
          posted_date: '',
        })
        setEditingAnnouncementId(null)
        fetchAnnouncements()
      }
    }
  }

  const handleAnnouncementEdit = (item) => {
    setEditingAnnouncementId(item.id)
    setAnnouncementData({
      title: item.title || '',
      message: item.message || '',
      audience: item.audience || '',
      posted_by: item.posted_by || '',
      posted_date: item.posted_date || '',
    })
    setAnnouncementMessage('Editing announcement...')
    setActiveSection('announcements')
  }

  const handleAnnouncementDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this announcement?')
    if (!confirmDelete) return

    const { error } = await supabase.from('announcements').delete().eq('id', id)

    if (error) {
      setAnnouncementMessage('Error deleting announcement: ' + error.message)
    } else {
      setAnnouncementMessage('Announcement deleted successfully!')
      fetchAnnouncements()
    }
  }

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.full_name : 'Unknown Member'
  }

  const getMemberContributionTotal = (memberId) => {
    return contributions
      .filter((item) => item.member_id === memberId)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }

  const getMemberLoanCount = (memberId) => {
    return loanRequests.filter((loan) => loan.member_id === memberId).length
  }

  const getMemberPendingLoanCount = (memberId) => {
    return loanRequests.filter(
      (loan) => loan.member_id === memberId && loan.status === 'Pending'
    ).length
  }

  const getMemberApprovedLoanCount = (memberId) => {
    return loanRequests.filter(
      (loan) => loan.member_id === memberId && loan.status === 'Approved'
    ).length
  }

  const filteredMembers = members.filter((member) => {
    const search = memberSearch.toLowerCase()
    return (
      (member.full_name || '').toLowerCase().includes(search) ||
      (member.phone || '').toLowerCase().includes(search) ||
      (member.occupation || '').toLowerCase().includes(search)
    )
  })

  const totalContributionAmount = contributions.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )

  const totalApprovedLoans = loanRequests.filter(
    (loan) => loan.status === 'Approved'
  ).length

  const totalPendingLoans = loanRequests.filter(
    (loan) => loan.status === 'Pending'
  ).length

  const totalRejectedLoans = loanRequests.filter(
    (loan) => loan.status === 'Rejected'
  ).length

  const filteredContributions = contributions.filter((item) => {
    const memberName = getMemberName(item.member_id).toLowerCase()
    const matchesSearch = memberName.includes(contributionSearch.toLowerCase())
    const matchesType =
      contributionTypeFilter === '' || item.payment_type === contributionTypeFilter

    return matchesSearch && matchesType
  })

  const filteredLoans = loanRequests.filter((loan) => {
    const memberName = getMemberName(loan.member_id).toLowerCase()
    const matchesSearch = memberName.includes(loanSearch.toLowerCase())
    const matchesStatus =
      loanStatusFilter === '' || loan.status === loanStatusFilter

    return matchesSearch && matchesStatus
  })

  const handlePrintSection = () => {
    window.print()
  }

  const downloadCSV = (filename, rows) => {
    if (!rows || rows.length === 0) {
      alert('No data to export.')
      return
    }

    const headers = Object.keys(rows[0])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? ''
            const escaped = String(value).replace(/"/g, '""')
            return `"${escaped}"`
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportMembers = () => {
    const rows = members.map((member) => ({
      full_name: member.full_name,
      phone: member.phone,
      email: member.email,
      address: member.address,
      gender: member.gender,
      occupation: member.occupation,
      share_capital: member.share_capital,
      monthly_contribution: member.monthly_contribution,
      total_contributions_paid: getMemberContributionTotal(member.id),
      total_loan_requests: getMemberLoanCount(member.id),
      pending_loans: getMemberPendingLoanCount(member.id),
      approved_loans: getMemberApprovedLoanCount(member.id),
    }))

    downloadCSV('ensyfa_members.csv', rows)
  }

  const handleExportContributions = () => {
    const rows = filteredContributions.map((item) => ({
      member_name: getMemberName(item.member_id),
      amount: item.amount,
      payment_date: item.payment_date,
      payment_type: item.payment_type,
      note: item.note,
    }))

    downloadCSV('ensyfa_contributions.csv', rows)
  }

  const handleExportLoans = () => {
    const rows = filteredLoans.map((loan) => ({
      member_name: getMemberName(loan.member_id),
      amount_requested: loan.amount_requested,
      reason: loan.reason,
      status: loan.status,
      request_date: loan.request_date,
      approval_date: loan.approval_date,
      note: loan.note,
    }))

    downloadCSV('ensyfa_loans.csv', rows)
  }

  const pageLayoutStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
    gap: '28px',
    alignItems: 'start',
  }

  const historyPanelStyle = {
    width: '100%',
    display: 'grid',
    gap: '18px',
    alignContent: 'start',
  }

  const actionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  }

  if (!session) {
    return (
      <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
  <img
    src="/ensyfa-logo.png"
    alt="ENSYFA Logo"
    style={{ width: '90px', height: '90px', objectFit: 'contain', marginBottom: '12px' }}
  />
  <h1>ENSYFA Admin Login</h1>
  <p>Please sign in to access the management dashboard.</p>
</div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        {loginMessage && <p style={{ marginTop: '15px' }}>{loginMessage}</p>}
      </div>
    )
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
  <img
    src="/ensyfa-logo.png"
    alt="ENSYFA Logo"
    style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '12px' }}
  />
  <div>
    <h1>ENSYFA Digital Platform</h1>
    <p>Welcome to ENSYFA management system.</p>
  </div>
</div>
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '30px',
        }}
      >
        <button onClick={() => setActiveSection('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveSection('members')}>Members</button>
        <button onClick={() => setActiveSection('contributions')}>Contributions</button>
        <button onClick={() => setActiveSection('loans')}>Loans</button>
        <button onClick={() => setActiveSection('announcements')}>Announcements</button>
      </div>

      {activeSection === 'dashboard' && (
        <div>
          <h2>Dashboard Summary</h2>
          <div
            style={{
              display: 'grid',
              gap: '15px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Total Members</h3>
              <p>{members.length}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Total Contributions</h3>
              <p>{contributions.length}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Total Contribution Amount</h3>
              <p>₦{totalContributionAmount.toLocaleString()}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Total Loan Requests</h3>
              <p>{loanRequests.length}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Approved Loans</h3>
              <p>{totalApprovedLoans}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Pending Loans</h3>
              <p>{totalPendingLoans}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Rejected Loans</h3>
              <p>{totalRejectedLoans}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>Total Announcements</h3>
              <p>{announcements.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'members' && (
        <div>
          <h2>{editingId ? 'Edit Member' : 'Register Member'}</h2>

          <div style={pageLayoutStyle}>
            <div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '100%' }}>
                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
                <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} />
                <input type="number" name="share_capital" placeholder="Share Capital" value={formData.share_capital} onChange={handleChange} />
                <input
                  type="number"
                  name="monthly_contribution"
                  placeholder="Monthly Contribution"
                  value={formData.monthly_contribution}
                  onChange={handleChange}
                />

                <button type="submit">{editingId ? 'Update Member' : 'Save Member'}</button>

                {editingId && (
                  <button type="button" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
              </form>

              {message && <p style={{ marginTop: '15px' }}>{message}</p>}
            </div>

            <div style={historyPanelStyle}>
              <div style={actionHeaderStyle}>
                <h2>View Members</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handlePrintSection}>Print Members</button>
                  <button type="button" onClick={handleExportMembers}>Export Members CSV</button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Search by name, phone, or occupation"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{ maxWidth: '420px' }}
              />

              {filteredMembers.length === 0 ? (
                <p>No matching members found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '8px',
                        maxWidth: '100%',
                      }}
                    >
                      <h3>{member.full_name}</h3>
                      <p><strong>Phone:</strong> {member.phone}</p>
                      <p><strong>Email:</strong> {member.email}</p>
                      <p><strong>Address:</strong> {member.address}</p>
                      <p><strong>Gender:</strong> {member.gender}</p>
                      <p><strong>Occupation:</strong> {member.occupation}</p>
                      <p><strong>Share Capital:</strong> {member.share_capital}</p>
                      <p><strong>Monthly Contribution:</strong> {member.monthly_contribution}</p>
                      <p><strong>Total Contributions Paid:</strong> ₦{getMemberContributionTotal(member.id).toLocaleString()}</p>
                      <p><strong>Total Loan Requests:</strong> {getMemberLoanCount(member.id)}</p>
                      <p><strong>Pending Loans:</strong> {getMemberPendingLoanCount(member.id)}</p>
                      <p><strong>Approved Loans:</strong> {getMemberApprovedLoanCount(member.id)}</p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(member)}>Edit</button>
                        <button onClick={() => handleDelete(member.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'contributions' && (
        <div>
          <h2>Contributions Management</h2>

          <div style={pageLayoutStyle}>
            <div>
              <form
                onSubmit={handleContributionSubmit}
                style={{ display: 'grid', gap: '10px', maxWidth: '100%' }}
              >
                <select
                  name="member_id"
                  value={contributionData.member_id}
                  onChange={handleContributionChange}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount Paid"
                  value={contributionData.amount}
                  onChange={handleContributionChange}
                  required
                />

                <input
                  type="date"
                  name="payment_date"
                  value={contributionData.payment_date}
                  onChange={handleContributionChange}
                  required
                />

                <select
                  name="payment_type"
                  value={contributionData.payment_type}
                  onChange={handleContributionChange}
                  required
                >
                  <option value="">Select Contribution Type</option>
                  <option value="Ordinary Savings">Ordinary Savings</option>
                  <option value="Special Savings">Special Savings</option>
                </select>

                <input
                  type="text"
                  name="note"
                  placeholder="Note"
                  value={contributionData.note}
                  onChange={handleContributionChange}
                />

                <button type="submit">
                  {editingContributionId ? 'Update Contribution' : 'Save Contribution'}
                </button>

                {editingContributionId && (
                  <button
                    type="button"
                    onClick={() => {
                      setContributionData({
                        member_id: '',
                        amount: '',
                        payment_date: '',
                        payment_type: '',
                        note: '',
                      })
                      setEditingContributionId(null)
                      setContributionMessage('')
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {contributionMessage && (
                <p style={{ marginTop: '15px' }}>{contributionMessage}</p>
              )}
            </div>

            <div style={historyPanelStyle}>
              <div style={actionHeaderStyle}>
                <h2>Contribution History</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handlePrintSection}>Print Contributions</button>
                  <button type="button" onClick={handleExportContributions}>Export Contributions CSV</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '10px', maxWidth: '420px' }}>
                <input
                  type="text"
                  placeholder="Search contribution by member name"
                  value={contributionSearch}
                  onChange={(e) => setContributionSearch(e.target.value)}
                />

                <select
                  value={contributionTypeFilter}
                  onChange={(e) => setContributionTypeFilter(e.target.value)}
                >
                  <option value="">All Contribution Types</option>
                  <option value="Ordinary Savings">Ordinary Savings</option>
                  <option value="Special Savings">Special Savings</option>
                </select>
              </div>

              {filteredContributions.length === 0 ? (
                <p>No contributions found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {filteredContributions.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '8px',
                        maxWidth: '100%',
                      }}
                    >
                      <h3>{getMemberName(item.member_id)}</h3>
                      <p><strong>Amount:</strong> {item.amount}</p>
                      <p><strong>Payment Date:</strong> {item.payment_date}</p>
                      <p><strong>Contribution Type:</strong> {item.payment_type}</p>
                      <p><strong>Note:</strong> {item.note}</p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleContributionEdit(item)}>Edit</button>
                        <button onClick={() => handleContributionDelete(item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'loans' && (
        <div>
          <h2>Loan Requests Management</h2>

          <div style={pageLayoutStyle}>
            <div>
              <form
                onSubmit={handleLoanSubmit}
                style={{ display: 'grid', gap: '10px', maxWidth: '100%' }}
              >
                <select
                  name="member_id"
                  value={loanData.member_id}
                  onChange={handleLoanChange}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="amount_requested"
                  placeholder="Amount Requested"
                  value={loanData.amount_requested}
                  onChange={handleLoanChange}
                  required
                />

                <input
                  type="text"
                  name="reason"
                  placeholder="Reason for Loan"
                  value={loanData.reason}
                  onChange={handleLoanChange}
                  required
                />

                <select
                  name="status"
                  value={loanData.status}
                  onChange={handleLoanChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <input
                  type="date"
                  name="request_date"
                  value={loanData.request_date}
                  onChange={handleLoanChange}
                  required
                />

                <input
                  type="date"
                  name="approval_date"
                  value={loanData.approval_date}
                  onChange={handleLoanChange}
                />

                <input
                  type="text"
                  name="note"
                  placeholder="Note"
                  value={loanData.note}
                  onChange={handleLoanChange}
                />

                <button type="submit">
                  {editingLoanId ? 'Update Loan Request' : 'Save Loan Request'}
                </button>

                {editingLoanId && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoanData({
                        member_id: '',
                        amount_requested: '',
                        reason: '',
                        status: 'Pending',
                        request_date: '',
                        approval_date: '',
                        note: '',
                      })
                      setEditingLoanId(null)
                      setLoanMessage('')
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {loanMessage && <p style={{ marginTop: '15px' }}>{loanMessage}</p>}
            </div>

            <div style={historyPanelStyle}>
              <div style={actionHeaderStyle}>
                <h2>Loan Requests History</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handlePrintSection}>Print Loans</button>
                  <button type="button" onClick={handleExportLoans}>Export Loans CSV</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '10px', maxWidth: '420px' }}>
                <input
                  type="text"
                  placeholder="Search loan by member name"
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                />

                <select
                  value={loanStatusFilter}
                  onChange={(e) => setLoanStatusFilter(e.target.value)}
                >
                  <option value="">All Loan Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {filteredLoans.length === 0 ? (
                <p>No loan requests found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {filteredLoans.map((loan) => (
                    <div
                      key={loan.id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '8px',
                        maxWidth: '100%',
                      }}
                    >
                      <h3>{getMemberName(loan.member_id)}</h3>
                      <p><strong>Amount Requested:</strong> {loan.amount_requested}</p>
                      <p><strong>Reason:</strong> {loan.reason}</p>
                      <p><strong>Status:</strong> {loan.status}</p>
                      <p><strong>Request Date:</strong> {loan.request_date}</p>
                      <p><strong>Approval Date:</strong> {loan.approval_date}</p>
                      <p><strong>Note:</strong> {loan.note}</p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleLoanEdit(loan)}>Edit</button>
                        <button onClick={() => handleLoanDelete(loan.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'announcements' && (
        <div>
          <h2>Announcements Management</h2>

          <div style={pageLayoutStyle}>
            <div>
              <form
                onSubmit={handleAnnouncementSubmit}
                style={{ display: 'grid', gap: '10px', maxWidth: '100%' }}
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Announcement Title"
                  value={announcementData.title}
                  onChange={handleAnnouncementChange}
                  required
                />

                <input
                  type="text"
                  name="message"
                  placeholder="Announcement Message"
                  value={announcementData.message}
                  onChange={handleAnnouncementChange}
                  required
                />

                <select
                  name="audience"
                  value={announcementData.audience}
                  onChange={handleAnnouncementChange}
                  required
                >
                  <option value="">Select Audience</option>
                  <option value="All Members">All Members</option>
                  <option value="Executives">Executives</option>
                  <option value="Loan Applicants">Loan Applicants</option>
                </select>

                <input
                  type="text"
                  name="posted_by"
                  placeholder="Posted By"
                  value={announcementData.posted_by}
                  onChange={handleAnnouncementChange}
                  required
                />

                <input
                  type="date"
                  name="posted_date"
                  value={announcementData.posted_date}
                  onChange={handleAnnouncementChange}
                  required
                />

                <button type="submit">
                  {editingAnnouncementId ? 'Update Announcement' : 'Save Announcement'}
                </button>

                {editingAnnouncementId && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementData({
                        title: '',
                        message: '',
                        audience: '',
                        posted_by: '',
                        posted_date: '',
                      })
                      setEditingAnnouncementId(null)
                      setAnnouncementMessage('')
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {announcementMessage && (
                <p style={{ marginTop: '15px' }}>{announcementMessage}</p>
              )}
            </div>

            <div style={historyPanelStyle}>
              <h2>Announcements History</h2>

              {announcements.length === 0 ? (
                <p>No announcements found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '8px',
                        maxWidth: '100%',
                      }}
                    >
                      <h3>{item.title}</h3>
                      <p><strong>Message:</strong> {item.message}</p>
                      <p><strong>Audience:</strong> {item.audience}</p>
                      <p><strong>Posted By:</strong> {item.posted_by}</p>
                      <p><strong>Posted Date:</strong> {item.posted_date}</p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleAnnouncementEdit(item)}>Edit</button>
                        <button onClick={() => handleAnnouncementDelete(item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App