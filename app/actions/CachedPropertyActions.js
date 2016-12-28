import alt from "../../common/altObj";

class CachedPropertyActions {
    
    set(name, value) {
        return { name, value };
    }
    
    get(name) {
        return { name };
    }
    
    reset() {
        return null;
    }
    
}

var CachedPropertyActionsWrapped = alt.createActions(CachedPropertyActions)
export default CachedPropertyActionsWrapped