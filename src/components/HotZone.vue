<template>
    <div
        ref="content"
        class="hz-m-wrap"
        @click="onSelect(null)"
    >
        <img
            :src="image"
            class="hz-u-img"
            alt=""
        />
        <div
            v-add-item
            class="hz-m-area"
        >
            <zone
                v-for="(zone, index) in zones"
                :key="index"
                class="hz-m-item"
                :class="{
                    'hz-m-item-selected': zone.selected
                }"
                :index="index"
                :setting="zone"
                @delItem="removeItem($event)"
                @changeInfo="changeInfo($event)"
                @click.stop="onSelect(zone)"
            ></zone>
        </div>
    </div>
</template>

<script>
import Zone from './Zone.vue';
import addItem from '../directives/addItem';

export default {
    name: 'HotZone',
    directives: {
        addItem
    },
    components: {
        Zone
    },
    props: {
        image: {
            type: String,
            required: true
        },
        // Vue3 默认 v-model：v-model -> modelValue / update:modelValue
        modelValue: {
            type: Array,
            default: () => []
        },
        // 兼容旧用法（如果外部传了 value）
        value: {
            type: Array,
            default: () => []
        },
        max: {
            type: Number,
            default: Infinity
        }
    },
    computed: {
        zones: {
            get() {
                // Vue3 v-model 优先，兼容 value 兜底
                return this.modelValue ?? this.value;
            },
            set(value) {
                // Vue3
                this.$emit('update:modelValue', value);
                // 兼容旧用法（如果外部仍在监听 input）
                this.$emit('input', value);
            }
        }
    },
    methods: {
        findCurSelect() {
            return this.zones.find(item => item.selected);
        },
        onSelect(zone) {
            const curZone = this.findCurSelect();
            if (curZone) curZone.selected = 0;

            if (zone) {
                // Vue3 中给响应式对象新增/更新字段直接赋值即可
                zone.selected = 1;
            }
            this.$emit('select-zone', zone);
        },
        changeInfo(res) {
            const { info, index } = res;

            this.changeItem(info, index);
        },
        addItem(setting) {
            this.zones.push(setting);
            this.hasChange();
            this.$emit('add', setting);
            this.onSelect(setting);
        },
        eraseItem(index = this.zones.length - 1) {
            this.removeItem(index);
            this.$emit('erase', index);
        },
        isOverRange() {
            const { max, zones } = this;

            return max && zones.length > max;
        },
        overRange() {
            const index = this.zones.length - 1;

            this.removeItem(index);
            this.$emit('overRange', index);
        },
        removeItem(index = this.zones.length - 1) {
            const curZone = this.zones[index];
            // 移除当前选中的
            if (curZone === this.findCurSelect()) {
                this.onSelect(null);
            }

            //  移除当前项
            this.zones.splice(index, 1);
            this.hasChange();
            this.$emit('remove', curZone, index);
        },
        changeItem(info, index = this.zones.length - 1) {
            Object.assign(this.zones[index], info);
            this.hasChange();
            this.onSelect(this.zones[index]);
        },
        hasChange() {
            this.$emit('change', this.zones);
        }
    }
};
</script>
