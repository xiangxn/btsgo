/**
 * Created by necklace on 2017/3/17.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import AltContainer from "alt-container";
import ConfirmStore from "../../stores/layout/ConfirmStore";
import ConfirmActions from "../../actions/layout/ConfirmActions";
import Modal from "./Modal";

class Confirm extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = this.initState();
        this.close = this.close.bind(this);
    }

    initState() {
        return {show: false};
    }

    componentWillReceiveProps(props) {
        if (props.show !== undefined) {
            let show = props.show ? true : false;
            this.setState({show: show});
        }
    }

    reset() {
        ConfirmActions.reset();
    }

    close() {
        this.setState({show: false});
    }

    okClick(e) {
        this.close();
        if (this.props.onOK) {
            this.props.onOK();
        }
        this.reset();
    }

    cancelClick(e) {
        this.close();
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.reset();
    }

    render() {
        let {title, msg, height, showCancelButton} = this.props;
        return (
            <div className="popup-window">
                <Modal visible={this.state.show} onClose={this.close.bind(this)} height={height}>
                    <div className="title">{title}</div>
                    <div className="message-box"></div>
                    <div className="message-box">
                        {msg}
                    </div>
                    <div className="buttons">
                        <input onClick={this.okClick.bind(this)} className="green-btn" type="button"
                               value={this.formatMessage('btn_ok')}/>&nbsp;&nbsp;&nbsp;&nbsp;
                        {!showCancelButton ? null :
                            <input onClick={this.cancelClick.bind(this)} className="white-btn" type="button"
                                   value={this.formatMessage('btn_cancel')}/>
                        }
                    </div>
                </Modal>
            </div>
        );
    }
}

class ConfirmContainer extends React.Component {
    render() {
        return (
            <AltContainer store={ConfirmStore}>
                <Confirm/>
            </AltContainer>
        )
    }
}
export default ConfirmContainer