// this function is using Typescript's assertion function,
// it ensures that whatever condition is being checked, must be true for the remainder scope!
// so it makes sure the value is indeed there and not null!
// we use generics to make this reusable to check any value
export default function assertIsDefined<T>(value:T): asserts value is NonNullable<T> {
    if (!value) {
        throw Error("Expected 'value' to be defined, but received :" + value)
    }
}