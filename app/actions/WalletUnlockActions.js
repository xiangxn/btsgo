import alt from "../../common/altObj";

class WalletUnlockActions {

    /** If you get resolved then the wallet is or was just unlocked.  If you get
        rejected then the wallet is still locked.
        
        @return nothing .. Just test for resolve() or reject() 
    */
    unlock() {
        return new Promise( (resolve, reject) => {
            return {resolve, reject};
        }).then( was_unlocked => {
            //DEBUG  console.log('... WalletUnlockStore\tmodal unlock')
            if(was_unlocked)
                WrappedWalletUnlockActions.change()
        })
    }
    
    lock() {
        return new Promise( resolve => {
            return {resolve};
        }).then( was_unlocked => {
            if(was_unlocked)
                WrappedWalletUnlockActions.change()
        })
    }
    
    cancel() {
        return null;
    }
    
    change() {
        return null;
    }
    
}

var WrappedWalletUnlockActions = alt.createActions(WalletUnlockActions)
export default WrappedWalletUnlockActions
