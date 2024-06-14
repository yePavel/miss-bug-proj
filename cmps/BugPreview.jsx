

export function BugPreview({bug}) {

    return <artice>
        <h4>{bug.title}</h4>
        <h1>🐛</h1>
        <p>Severity: <span>{bug.severity}</span></p>
    </artice>
}