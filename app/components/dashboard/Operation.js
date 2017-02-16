/**
 * Created by necklace on 2017/2/16.
 */
import React from "react";
import BaseComponent from "../BaseComponent";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import {ChainStore, ChainTypes as grapheneChainTypes} from "graphenejs-lib";
import account_constants from "../../../common/account_constants";
import BlockTime from "../Blockchain/BlockTime";
import FormattedAsset from "../Utility/FormattedAsset";
import utils from "../../../common/utils";

const {operations} = grapheneChainTypes;
let ops = Object.keys(operations);
let listings = account_constants.account_listing;

class Info extends BaseComponent {
    static propTypes = {
        /**
         * 链全局对象
         */
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0"
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        let {block, dynGlobalObject} = this.props;
        let last_irreversible_block_num = dynGlobalObject.get("last_irreversible_block_num");
        if (nextProps.dynGlobalObject === this.props.dynGlobalObject) {
            return false;
        }
        return block > last_irreversible_block_num;
    }

    getTrxType(type) {
        let id = "trxTypes_" + ops[type];
        return id;
    }

    render() {
        let {block, fee, type} = this.props;

        let last_irreversible_block_num = this.props.dynGlobalObject.get("last_irreversible_block_num");
        let pending = null;
        if (block > last_irreversible_block_num) {
            pending = <span>({this.formatMessage('operation_pending', block - last_irreversible_block_num)})</span>
        }
        fee.amount = parseInt(fee.amount, 10);

        return (
            <div className="last-operation-row">
                <span>{this.formatMessage(this.getTrxType(type))}</span>
                <div>
                    <div>{this.props.info}</div>
                    <div>
                        <BlockTime block_number={block}/> - <FormattedAsset amount={fee.amount} asset={fee.asset_id}/>
                        {pending ? <span> - {pending}</span> : null}
                    </div>
                </div>
            </div>
        );
    }
}
Info = BindToChainState(info, {keep_updating: true});

class Operation extends BaseComponent {
    static propTypes = {
        op: React.PropTypes.array.isRequired,
        current: React.PropTypes.string,
        block: React.PropTypes.number
    };

    static defaultProps = {
        op: [],
        current: "",
        block: null,
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        if (!this.props.op || !nextProps.op) {
            return false;
        }
        return !utils.are_equal_shallow(nextProps.op[1], this.props.op[1]);
    }

    render() {
        let {op, current, block} = this.props;
        let line = null, column = null;
        let memoComponent = null;

        line = column ? (<Info block={block} type={op[0]} fee={op[1].fee} info={column}/>) : null;
        return (
            line ? line : <div className="last-operation-row"></div>
        );
    }
}

