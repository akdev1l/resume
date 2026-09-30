import { description, fullName, type Resume } from "../../core/resume";

export function TopBar({ resume }: { resume: Resume }) {
  const name = fullName(resume);

  return (
    <header className="top-bar">
      <div className="container top-bar-content">
        <hgroup>
          <h1>{name}</h1>
          <p>{description(resume)}</p>
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
