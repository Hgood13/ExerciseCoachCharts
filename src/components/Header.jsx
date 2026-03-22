export default function Header({ title = "The Exercise Coach" }) {
  return (
    <div className="header">
      <div className="header-content">
        <div className="logo-section">
          <img
            src="/images/TEC_logo.svg"
            alt="The Exercise Coach"
            className="logo"
          />
        </div>
        <h1 className="header-title">{title}</h1>
      </div>
    </div>
  )
}
