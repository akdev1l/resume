import { Link } from "react-router";

import { PageTitle } from "../layout/PageTitle";

export function NotFoundPage() {
  return (
    <article>
      <PageTitle title="Page not found" />
      <p>
        There's nothing at this address. <Link to="/">Back to the resume</Link>.
      </p>
    </article>
  );
}
