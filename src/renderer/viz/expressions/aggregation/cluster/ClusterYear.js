import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterYear extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterYear');
        super({
            property,
            expressionName: 'clusterYear',
            dimension: {
                group: {
                    units: 'year',
                    count: count,
                    starting,
                    timezone
                }
            },
            type: 'number'
        });
    }
}
