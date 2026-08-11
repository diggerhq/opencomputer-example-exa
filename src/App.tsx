import { FormEvent, ReactNode, useState } from "react";
import { useAgent } from "./use-agent";

const examples = [
  "What are the latest developments in AI coding agents?",
  "Find recent companies hiring their first DevOps engineer",
  "Compare the newest open-source browser automation tools",
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

function LinkifiedText({ children }: { children: string }) {
  const parts = children.split(/(https?:\/\/[^\s)\]]+)/g);
  return <>{parts.map((part, index) => part.startsWith("http") ? <a key={index} href={part} target="_blank" rel="noreferrer">{part.replace(/^https?:\/\//, "")}</a> : <span key={index}>{part}</span>)}</>;
}

export default function App() {
  const [input, setInput] = useState("");
  const { messages, send, isRunning, error } = useAgent();

  function submit(event: FormEvent) {
    event.preventDefault();
    runSearch(input);
  }

  function runSearch(query: string) {
    if (!query.trim() || isRunning) return;
    setInput("");
    void send(query);
  }

  return (
    <div className="site-shell">
      <header className="nav">
        <a className="wordmark" href="#top"><span>e</span><strong>Exa research</strong><em>DEMO</em></a>
        <div className="nav-right"><span className="connection"><i/> API connected</span><a href="#how-it-works">How it works</a><a href="https://exa.ai" target="_blank" rel="noreferrer">About Exa ↗</a></div>
      </header>

      <main id="top">
        <section className={`hero ${messages.length ? "has-results" : ""}`}>
          <div className="hero-copy">
            <span className="eyebrow"><i>✦</i> LIVE WEB RESEARCH</span>
            <h1>Ask the web.<br/><span>Get a sourced answer.</span></h1>
            <p>This demo uses Exa to find relevant pages, read their contents, and turn live web research into a clear answer with sources.</p>
          </div>

          <section className="search-panel" aria-label="Exa research demo">
            <form className="search-form" onSubmit={submit}>
              <span className="search-icon"><SearchIcon/></span>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); runSearch(input); } }} placeholder="What do you want to research?" aria-label="Research question" rows={2}/>
              <button disabled={isRunning || !input.trim()} aria-label="Search with Exa">{isRunning ? <span className="spinner"/> : <ArrowIcon/>}</button>
            </form>

            {messages.length === 0 ? (
              <div className="starter-area">
                <span>TRY AN EXAMPLE</span>
                <div className="examples">{examples.map((example) => <button key={example} onClick={() => runSearch(example)}><span>{example}</span><ArrowIcon/></button>)}</div>
              </div>
            ) : (
              <div className="conversation" aria-live="polite">
                {messages.map((message) => (
                  <article key={message.id} className={`message ${message.role}`}>
                    <div className="message-label">{message.role === "user" ? <span className="user-dot">You</span> : <><span className="exa-mini">e</span><span>Exa research agent</span></>}</div>
                    <div className="message-body">{message.text ? <LinkifiedText>{message.text}</LinkifiedText> : <div className="researching"><span/><span/><span/><em>Searching the live web…</em></div>}</div>
                  </article>
                ))}
                {!isRunning && <div className="follow-up"><span>Ask a follow-up</span><button onClick={() => setInput("Go deeper and prioritize primary sources.")}>Go deeper</button><button onClick={() => setInput("Summarize the key takeaways in bullets.")}>Summarize</button></div>}
              </div>
            )}
            {error && <p className="error"><strong>Research failed.</strong> {error}</p>}
            <footer className="search-footer"><span><kbd>↵</kbd> to search · <kbd>⇧ ↵</kbd> for a new line</span><span>Powered by <strong>Exa</strong> + OpenComputer</span></footer>
          </section>
        </section>

        <section className="how" id="how-it-works">
          <div className="section-heading"><span>BEHIND THE DEMO</span><h2>From question to evidence.</h2><p>The model doesn’t answer from memory alone. It gets a purpose-built search tool and uses live results.</p></div>
          <div className="steps">
            <Step number="01" icon={<SearchIcon/>} title="Understand the question">The agent turns your request into a descriptive search query and chooses useful filters.</Step>
            <Step number="02" icon={<span className="exa-step">e</span>} title="Search with Exa">Exa ranks relevant pages and returns highlights or full text from the live web.</Step>
            <Step number="03" icon={<span className="answer-icon">Aa</span>} title="Answer with sources">The agent compares the evidence, explains what it found, and includes the source URLs.</Step>
          </div>
        </section>

        <section className="capabilities">
          <div><span className="cap-label">WHAT YOU CAN TRY</span><h2>Research that goes beyond keywords.</h2></div>
          <div className="cap-grid"><Capability title="Fresh information">Find recent news, launches, hiring signals, and market changes.</Capability><Capability title="Semantic search">Describe what you need naturally instead of guessing exact keywords.</Capability><Capability title="Focused sources">Constrain research by domain, date, or category when precision matters.</Capability><Capability title="Page understanding">Retrieve relevant passages or full text—not just titles and links.</Capability></div>
        </section>
      </main>

      <footer className="page-footer"><div className="wordmark muted"><span>e</span><strong>Exa research</strong></div><p>A small demonstration of tool-using agents.</p><a href="#top">Back to top ↑</a></footer>
    </div>
  );
}

function Step({ number, icon, title, children }: { number: string; icon: ReactNode; title: string; children: ReactNode }) {
  return <article className="step"><div className="step-top"><span className="step-icon">{icon}</span><em>{number}</em></div><h3>{title}</h3><p>{children}</p></article>;
}

function Capability({ title, children }: { title: string; children: ReactNode }) {
  return <article className="cap"><span>↗</span><h3>{title}</h3><p>{children}</p></article>;
}
