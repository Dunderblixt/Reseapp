"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";
import { readExplorerQuery } from "@/lib/explorer-query";

// Link back to the explorer that restores the last search, filter, sort, and pagination.
export function ExplorerLink({
  hash,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { hash?: string }) {
  const [href, setHref] = useState("/");

  useEffect(() => {
    const query = readExplorerQuery();
    setHref(`/${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`);
  }, [hash]);

  return <Link {...props} href={href} />;
}
