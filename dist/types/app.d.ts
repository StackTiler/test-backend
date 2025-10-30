declare class AwareAuthApp {
    private expressApp;
    private readonly routeManger;
    private readonly databaseConnector;
    private readonly PORT;
    private server?;
    private shuttingDown;
    constructor();
    private configureApp;
    private handleProcessEvents;
    private gracefulShutdown;
    initializeApplication(): void;
}
export default AwareAuthApp;
