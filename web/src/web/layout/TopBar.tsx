import { description, fullName, type Resume } from "../../core/resume";
import { TopBarTools } from "./TopBarTools";

export function TopBar({ resume }: { resume: Resume }) {
  const name = fullName(resume);
  const { location, github, email, phone } = resume.contact;

  return (
    <header className="top-bar">
      <TopBarTools />
      <div className="container top-bar-content">
        <hgroup>
          <h1>{name}</h1>
          <p>
            {description(resume)}
            <span className="top-bar-separator"> · </span>
            <a className="top-bar-location" href={location.url}>
              {location.text}
            </a>
          </p>
          <ul className="top-bar-contact" aria-label="Contact">
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={github.url}>{github.text}</a>
            </li>
            <li>
              <a href={`tel:${phone.number}`}>{phone.text}</a>
            </li>
          </ul>
        </hgroup>
        {resume.avatar ? (
          <img className="portrait" src={resume.avatar} alt={`Avatar of ${name}`} />
        ) : (
          <div className="portrait" role="img" aria-label={`Initials of ${name}`}>
            {resume.name.first[0] + resume.name.last[0]}
          </div>
        )}
      </div>
    </header>
  );
}
