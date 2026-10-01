import type { ReactNode } from "react";

import { fullName, type Resume } from "../../core/resume";
import { Footer } from "./Footer";
import { SiteNameContext } from "./site-name";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import "./layout.css";

interface LayoutProps {
  resume: Resume;
  children: ReactNode;
}

export function Layout({ resume, children }: LayoutProps) {
  const name = fullName(resume);
  return (
    <SiteNameContext value={name}>
      <TopBar resume={resume} />
      <div className="container layout-body">
        <SideNav />
        <main>{children}</main>
      </div>
      <Footer name={name} />
    </SiteNameContext>
  );
}
