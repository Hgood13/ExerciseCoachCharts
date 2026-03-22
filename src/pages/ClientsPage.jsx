import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { clients } from '../data/clients.js'

export default function ClientsPage() {
  return (
    <>
      <Header title="Coach Dashboard" />

      <div className="container">
        {/*
          MVP NOTE:
          This list is static for now.
          Later, it will be driven by a database.
        */}
        <Link to="/clients/add" id="addClientBtn" className="btn-primary">
          Add Client
        </Link>

        <ul id="clientList">
          {clients.map(client => (
            <li key={client.id}>
              <Link to={`/clients/${client.id}`}>{client.name}</Link>
            </li>
          ))}
        </ul>

        {/* Motivational Image Section */}
        <div className="motivational-section">
          <img
            src="/images/Strength_Changes_Everything.jpg"
            alt="Strength Changes Everything"
            className="motivational-image"
          />
        </div>
      </div>
    </>
  )
}
