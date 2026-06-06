"use client";
import { Container } from "@/components/layout/Container";
import CounterReactBits from "@/components/ReactBits/Counter.tsx";
import { useEffect, useState } from "react";

//github heatmap
import { GitHubCalendar } from 'react-github-calendar';

export default function OpenSourcePage() {
    const [counterValue, setCounterValue] = useState(0);
    // ####### Added an isMounted state to track client-side rendering #######
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // ####### Set isMounted to true so the component knows it's safe to render client-only UI #######
        setIsMounted(true);
        setCounterValue(293);
    }, []);

    return (
        <>
            <Container>
                <h1 className="font-headline-lg text-foreground">Open Source</h1>
                <p className="mt-6 max-w-3xl text-muted-foreground">
                    Currently exploring open source contribution workflows in TypeScript/JavaScript ecosystems. Learning codebase navigation, linting, issue triaging, Git workflows, and contribution practices.
                </p>

                {/* ####### Wrapped GitHubCalendar in isMounted check to fix the hydration error ####### */}
                {isMounted && <GitHubCalendar maxLevel={3} username="varadisthedev" />}

                <section className="mt-10">
                    <h3 className="font-headline-xs text-foreground">Upcoming Contributions</h3>
                    <div className="mt-3 prose text-muted-foreground">
                        <ul>
                            <li>PRs and issues will appear here as I contribute to open source projects.</li>
                        </ul>
                    </div>
                </section>
            </Container>
            <CounterReactBits value={counterValue} />
        </>
    );
}