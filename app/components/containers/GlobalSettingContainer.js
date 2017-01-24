/**
 * Created by necklace on 2017/1/25.
 */
import React from "react";
import GlobalSetting from "../GlobalSetting";
import SettingsStore from "../../stores/SettingsStore";
import IntlStore from "../../stores/IntlStore";
import AltContainer from "alt-container";

class GlobalSettingContainer extends React.Component {

    render() {

        return (
            <AltContainer
                stores={[SettingsStore]}
                inject={{
                    settings: () => {
                        return SettingsStore.getState().settings;
                    },
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    localesObject: () => {
                        return IntlStore.getState().localesObject;
                    }
                }}
            >
                <GlobalSetting/>
            </AltContainer>
        );
    }
}

export default GlobalSettingContainer;