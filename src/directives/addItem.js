import _ from '../utils';

export default {
    mounted(el, binding) {
        const ctx = binding.instance;
        const MIN_LIMIT = _.MIN_LIMIT;

        el.addEventListener('mousedown', handleMouseDown);

        function handleMouseDown(e) {
            e.preventDefault();

            let itemInfo = {
                top: _.getDistanceY(e, el),
                left: _.getDistanceX(e, el),
                width: 0,
                height: 0
            };
            const container = _.getOffset(el);

            // Only used once at the beginning of init
            const setting = {
                topPer: _.decimalPoint(itemInfo.top / container.height),
                leftPer: _.decimalPoint(itemInfo.left / container.width),
                widthPer: 0,
                heightPer: 0
            };
            let preX = _.getPageX(e);
            let preY = _.getPageY(e);

            ctx.addItem(setting);

            window.addEventListener('mousemove', handleChange);
            window.addEventListener('mouseup', handleMouseUp);

            // eslint-disable-next-line no-shadow
            function handleChange(e) {
                e.preventDefault();

                const moveX = _.getPageX(e) - preX;
                const moveY = _.getPageY(e) - preY;
                preX = _.getPageX(e);
                preY = _.getPageY(e);

                // Not consider the direction of movement first, consider only the lower right drag point
                const minLimit = 0;
                const styleInfo = _.dealBR(itemInfo, moveX, moveY, minLimit);

                // Boundary value processing
                itemInfo = _.dealEdgeValue(itemInfo, styleInfo, container);

                // 在刚 addItem 后，DOM 可能还未完成渲染（el.lastElementChild 为空）
                // 这里做一次保护，避免出现 Cannot read properties of null (reading 'style')
                const last = el.lastElementChild;
                if (!last) return;

                Object.assign(last.style, {
                    top: `${itemInfo.top}px`,
                    left: `${itemInfo.left}px`,
                    width: `${itemInfo.width}px`,
                    height: `${itemInfo.height}px`
                });
            }

            function handleMouseUp() {
                const perInfo = {
                    topPer: _.decimalPoint(itemInfo.top / container.height),
                    leftPer: _.decimalPoint(itemInfo.left / container.width),
                    widthPer: _.decimalPoint(itemInfo.width / container.width),
                    heightPer: _.decimalPoint(itemInfo.height / container.height)
                };

                if (ctx.isOverRange()) {
                    ctx.overRange();
                } else if (container.height < MIN_LIMIT && itemInfo.width > MIN_LIMIT) {
                    ctx.changeItem(Object.assign(perInfo, {
                        topPer: 0,
                        heightPer: 1
                    }));
                } else if (container.width < MIN_LIMIT && itemInfo.height > MIN_LIMIT) {
                    ctx.changeItem(Object.assign(perInfo, {
                        leftper: 0,
                        widthPer: 1
                    }));
                } else if (itemInfo.width > MIN_LIMIT && itemInfo.height > MIN_LIMIT) {
                    ctx.changeItem(perInfo);
                } else {
                    ctx.eraseItem();
                }

                window.removeEventListener('mousemove', handleChange);
                window.removeEventListener('mouseup', handleMouseUp);
            }
        }

        // Vue3 指令卸载时清理事件
        el._hzDestroy = () => el.removeEventListener('mousedown', handleMouseDown);
    },
    unmounted(el) {
        if (el._hzDestroy) el._hzDestroy();
    }
};
