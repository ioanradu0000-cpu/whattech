type ToolPageHeaderProps = {
  title: string
  description: string
  steps: string[]
  currentStep: number
}

export function ToolPageHeader({ title, description, steps, currentStep }: ToolPageHeaderProps) {
  return <header className="flowHeader">
    <h1>{title}</h1>
    <p>{description}</p>
    <ol className="stepRail" aria-label="Tool progress">
      {steps.map((label,index)=>{
        const step=index+1
        const status=step<currentStep?'complete':step===currentStep?'current':'upcoming'
        return <li className={status} aria-current={status==='current'?'step':undefined} key={label}>
          <span>{step}</span><b>{label}</b><i/>
        </li>
      })}
    </ol>
  </header>
}
