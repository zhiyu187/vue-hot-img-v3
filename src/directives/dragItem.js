import _ from '../utils';

export default {
    mounted(el, binding) {
        const ctx = binding.instance;
        el.addEventListener('mousedown', handleMouseDown);

        function handleMouseDown(e) {
            e.stopPropagation();

            const container = _.getOffset(el.parentNode);
            const preX = _.getPageX(e);
            const preY = _.getPageY(e);
            let topPer;
            let leftPer;
            let flag;

            window.addEventListener('mousemove', handleChange);
            window.addEventListener('mouseup', handleMouseUp);

            // eslint-disable-next-line no-shadow
            function handleChange(e) {
                e.preventDefault();
                flag = true;

                // Hide the info displayed by hover
                ctx.handlehideZone(true);

                const setting = ctx.setting;
                let moveX = _.getPageX(e) - preX;
                let moveY = _.getPageY(e) - preY;

                setting.topPer = setting.topPer || 0;
                setting.leftPer = setting.leftPer || 0;
                topPer = _.decimalPoint(moveY / container.height + setting.topPer);
                leftPer = _.decimalPoint(moveX / container.width + setting.leftPer);

                // Hotzone moving boundary processing
                if (topPer < 0) {
                    topPer = 0;
                    moveY = -container.height * setting.topPer;
                }

                if (leftPer < 0) {
                    leftPer = 0;
                    moveX = -container.width * setting.leftPer;
                }

                if (topPer + setting.heightPer > 1) {
                    topPer = 1 - setting.heightPer;
                    moveY = container.height * (topPer - setting.topPer);
                }

                if (leftPer + setting.widthPer > 1) {
                    leftPer = 1 - setting.widthPer;
                    moveX = container.width * (leftPer - setting.leftPer);
                }

                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }

            function handleMouseUp() {
                if (flag) {
                    flag = false;
                    el.style.transform = 'translate(0, 0)';
                    ctx.changeInfo({
                        topPer,
                        leftPer
                    });
                }

                // Show the info
                ctx.handlehideZone(false);

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
