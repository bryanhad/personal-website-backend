declare module "express-session" {//here, we declare on module, cuz we want to extend a particular type on a package.
    interface SessionData {
        returnTo?:string
    }
}

export { } //we jave to export or import something to let typescript know that this ia a module 