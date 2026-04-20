import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import Script from "next/script";

export const metadata = {
  title: 'One-Click CV — Currículo ATS do LinkedIn',
  description: 'Gera um currículo profissional e ATS-compatible direto do seu LinkedIn. Sem edição manual.',
};

const steps = [
  {
    num: '01',
    title: 'Autenticação',
    desc: 'Clique em "Entrar com LinkedIn". O sistema usa OAuth — você não digita senha aqui.',
  },
  {
    num: '02',
    title: 'Cookie de sessão',
    desc: 'Abra o LinkedIn no mesmo navegador. Pressione F12, vá em Application → Cookies → linkedin.com, copie o valor do campo li_at.',
  },
  {
    num: '03',
    title: 'Configure no Dashboard',
    desc: 'Cole o cookie li_at no campo indicado e preencha seu vanity name — a parte após /in/ na URL do seu perfil. Clique em "Save Cookie".',
  },
  {
    num: '04',
    title: 'Contatos opcionais',
    desc: 'Se quiser, adicione telefone, GitHub, Twitter ou site pessoal. Esses dados aparecem no cabeçalho do currículo gerado.',
  },
  {
    num: '05',
    title: 'Gere o PDF',
    desc: 'Clique em "Download PDF Resume". O sistema busca do LinkedIn: nome, headline, summary, experiências, certificações, educação e skills.',
  },
  {
    num: '06',
    title: 'Otimização ATS',
    desc: 'O conteúdo passa por análise de 7 categorias — contato, summary, experiência, skills, certificações, educação e keywords. O PDF é ajustado automaticamente.',
  },
];

const faqs = [
  {
    q: 'O cookie li_at expira?',
    a: 'Sim. O LinkedIn invalida o cookie periodicamente. Se o PDF sair vazio, pegue um novo cookie e salve novamente no Dashboard.',
  },
  {
    q: 'Meus dados ficam armazenados?',
    a: 'O cookie fica salvo localmente no servidor, em um arquivo .json. Nenhum dado é enviado a serviços externos.',
  },
  {
    q: 'Por que preciso do li_at?',
    a: 'O LinkedIn não libera API pública para apps não-parceiros. O li_at é sua sessão autenticada — permite ao sistema ler o perfil com os mesmos dados que você vê logado.',
  },
  {
    q: 'Em que formato o currículo é gerado?',
    a: 'PDF com layout de duas colunas. Sem tabelas ou imagens que prejudiquem o parse dos sistemas de RH.',
  },
  {
    q: 'Posso editar o conteúdo antes de gerar?',
    a: 'Ainda não. O conteúdo vem direto do LinkedIn. Edição manual está no roadmap.',
  },
  {
    q: 'Funciona para perfis em português?',
    a: 'Sim. Os dados são extraídos independentemente do idioma configurado no LinkedIn.',
  },
];

export default async function Home() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("Auth session fetch failed:", e.message);
  }

  if (session) redirect("/dashboard");

  return (
    <main className="container">

      {/* NAV */}
      <nav style={{ padding: "var(--space-md) 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontWeight: "700", fontSize: "1.2rem", color: "var(--text-main)", letterSpacing: "-0.3px" }}>
          One-Click CV
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a href="#como-usar" style={{ color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "none" }}>Como usar</a>
          <a href="#duvidas" style={{ color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "none" }}>Duvidas</a>
          <LoginButton className="btn-primary">Entrar com LinkedIn</LoginButton>
        </div>
      </nav>

      {/* HERO */}
      <section className="animate-fade" style={{ padding: "80px 0 60px", maxWidth: "680px" }}>
        <h1 style={{ lineHeight: 1.1, marginBottom: "1.5rem", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: "800", letterSpacing: "-1px" }}>
          Seu LinkedIn.<br />
          <span className="gradient-text">Virou currículo.</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "520px", marginBottom: "2rem" }}>
          Extrai experiências, certificações, skills e educação do seu LinkedIn e gera um PDF pronto para enviar — sem você editar nada.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <LoginButton className="btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
            Gerar meu currículo
          </LoginButton>
          <a
            href="https://www.vakinha.com.br/vaquinha/desafio-1-dev-1000-saas"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              padding: "0.85rem 1.8rem",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "0.95rem",
              border: "1px solid var(--border)",
            }}
          >
            Apoiar o projeto
          </a>
        </div>
      </section>

      {/* FEATURES — horizontal bar, sem cards */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "1.8rem 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem" }}>
        {[
          { title: 'ATS Score', desc: '7 categorias analisadas automaticamente' },
          { title: 'Extração completa', desc: 'Experiências, certs, skills, educação' },
          { title: 'PDF em segundos', desc: 'Duas colunas, tipografia limpa' },
          { title: 'Dados locais', desc: 'Nenhum envio a terceiros' },
        ].map(f => (
          <div key={f.title}>
            <p style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem", marginBottom: "0.3rem" }}>{f.title}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* MANUAL */}
      <section id="como-usar" style={{ padding: "60px 0" }}>
        <h2 style={{ marginBottom: "0.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>Como usar</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2.5rem" }}>
          Seis passos. A maioria automática.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ background: "var(--bg-card)", padding: "1.5rem 1.8rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--secondary)", letterSpacing: "1px", marginBottom: "0.6rem" }}>{step.num}</p>
              <h4 style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-main)", fontSize: "0.95rem" }}>{step.title}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Cookie guide */}
        <div style={{ marginTop: "2rem", padding: "1.5rem 1.8rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", borderLeft: "3px solid var(--secondary)" }}>
          <h4 style={{ fontWeight: "700", marginBottom: "1rem", color: "var(--text-main)", fontSize: "0.95rem" }}>Como encontrar o li_at (Firefox / Chrome)</h4>
          <ol style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 2.1, paddingLeft: "1.2rem" }}>
            <li>Abra <code style={{ color: "var(--secondary)", background: "rgba(100,255,218,0.07)", padding: "0 4px", borderRadius: "4px" }}>linkedin.com</code> e certifique-se de estar logado</li>
            <li>Pressione <strong style={{ color: "var(--text-main)" }}>F12</strong> para abrir o DevTools</li>
            <li>Vá na aba <strong style={{ color: "var(--text-main)" }}>Application</strong> (Chrome) ou <strong style={{ color: "var(--text-main)" }}>Storage</strong> (Firefox)</li>
            <li>Expanda Cookies → clique em <code style={{ color: "var(--secondary)", background: "rgba(100,255,218,0.07)", padding: "0 4px", borderRadius: "4px" }}>https://www.linkedin.com</code></li>
            <li>Encontre <code style={{ color: "var(--secondary)", background: "rgba(100,255,218,0.07)", padding: "0 4px", borderRadius: "4px" }}>li_at</code> e copie o valor completo</li>
            <li>Cole no campo <strong style={{ color: "var(--text-main)" }}>li_at cookie value</strong> no Dashboard</li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" style={{ padding: "0 0 60px" }}>
        <h2 style={{ marginBottom: "2rem", fontWeight: "800", letterSpacing: "-0.5px" }}>Duvidas frequentes</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((f, i) => (
            <div key={f.q} style={{
              padding: "1.3rem 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <p style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "0.4rem", fontSize: "0.95rem" }}>{f.q}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREATOR SECTION */}
      <section style={{ padding: "60px 0", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ marginBottom: "2rem", fontSize: "0.85rem", fontWeight: "700", color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Criador do Projeto</p>
        
        <a 
          href="https://www.linkedin.com/in/maximiliano-tarigo-dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card"
          style={{ 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1.5rem 2rem",
            textAlign: "left",
            maxWidth: "450px"
          }}
        >
          {/* Avatar Placeholder - LinkedIn Style */}
          <div style={{ 
            width: "72px", 
            height: "72px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--secondary), var(--accent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: "800",
            color: "#0a192f",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(100, 255, 218, 0.2)"
          }}>
            MT
          </div>
          
          <div>
            <h4 style={{ margin: "0 0 0.3rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "700" }}>
              Maximiliano Tarigo
            </h4>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.4 }}>
              Full Stack Developer & Founder<br />
              Especialista em Automação e SaaS
            </p>
            <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
              Ver perfil no LinkedIn ↗
            </div>
          </div>
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "var(--space-md) 0", color: "var(--text-muted)", borderTop: "1px solid var(--border)", fontSize: "0.82rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <span>© 2026 One-Click CV</span>
        <a href="https://www.vakinha.com.br/vaquinha/desafio-1-dev-1000-saas" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Apoiar o projeto</a>
      </footer>
    </main>
  );
}
