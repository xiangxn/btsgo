/**
 * Created by xiangxn on 2017/1/29.
 */
import React from "react";

const {PropTypes, Component} = React;
const propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    measure: PropTypes.string,
    visible: PropTypes.bool,
    showMask: PropTypes.bool,
    showCloseButton: PropTypes.bool,
    animation: PropTypes.string,
    duration: PropTypes.number,
    className: PropTypes.string,
    customStyles: PropTypes.object,
    customMaskStyles: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    outsideClose: PropTypes.bool        //是否可点窗口外关闭
};

const defaultProps = {
    width: 6,
    height: 3.6,
    measure: 'rem',
    visible: false,
    showMask: true,
    showCloseButton: true,
    animation: 'flip',
    duration: 300,
    className: '',
    customStyles: {},
    customMaskStyles: {},
    outsideClose: false
};

const Dialog = props => {
    const _onClose = () => {
        if (props.onClose) props.onClose(false);
    };
    const className = `modal-dialog modal-${props.animation}-${props.animationType}`;
    const CloseButton = props.showCloseButton ? <span className="modal-close" onClick={_onClose}/> : null;
    const {width, height, measure, duration, customStyles} = props;
    const style = {
        width: width + measure,
        height: height + measure,
        animationDuration: duration + 'ms',
        WebkitAnimationDuration: duration + 'ms'
    };

    const mergedStyles = Object.assign(style, customStyles)

    return (
        <div style={mergedStyles} className={className}>
            {CloseButton}
            {props.children}
        </div>
    )
};

class Modal extends Component {

    constructor(props) {
        super(props);

        this.animationEnd = this.animationEnd.bind(this);
        this.state = {
            isShow: false,
            animationType: 'leave'
        };
    }

    componentDidMount() {
        if (this.props.visible) {
            this.enter();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            this.enter();
        } else if (this.props.visible && !nextProps.visible) {
            this.leave();
        }
    }

    enter() {
        this.setState({
            isShow: true,
            animationType: 'enter'
        });
    }

    leave() {
        this.setState({
            animationType: 'leave'
        });
    }

    animationEnd() {
        if (this.state.animationType === 'leave') {
            this.setState({
                isShow: false
            });
        }
    }

    onMaskClick(e) {
        if (this.props.outsideClose && this.props.onClose) {
            this.props.onClose(false);
        }
    }

    render() {
        const mask = this.props.showMask ?
            <div className="modal-mask" style={this.props.customMaskStyles}
                 onClick={this.onMaskClick.bind(this)}/> : null;
        const style = {
            display: this.state.isShow ? 'block' : 'none',
            WebkitAnimationDuration: this.props.duration + 'ms',
            animationDuration: this.props.duration + 'ms'
        };

        return (
            <div style={style}
                 className={"modal modal-fade-" + this.state.animationType + ' ' + this.props.className}
                 onAnimationEnd={this.animationEnd}
            >
                {mask}
                <Dialog {...this.props} animationType={this.state.animationType}>
                    {this.props.children}
                </Dialog>
            </div>
        )
    }
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;

export default Modal;