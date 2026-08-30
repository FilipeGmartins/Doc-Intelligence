export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">Próxima etapa</p><h1>{title}</h1><p>{description}</p></div></div><div className="panel coming-soon"><span>Em construção</span><p>Esta rota já faz parte da navegação e será implementada incrementalmente.</p></div></div>
}
