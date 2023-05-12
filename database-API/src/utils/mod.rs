macro_rules! cast {
    ($target: expr, $pat: path) => {
        {
            if let $pat(a) = $target { // #1
                a
            } else {
                panic!(
                    "mismatch variant when cast to {}",
                    stringify!($pat)); // #2
            }
        }
    };
}

pub(crate) use cast;