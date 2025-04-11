(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func))
 (type $3 (func (result f64)))
 (type $4 (func (result i64)))
 (type $5 (func (param i32 i32 i32 i32)))
 (type $6 (func (param i64) (result i32)))
 (type $7 (func (result i32)))
 (type $8 (func (param i32 i32 i32)))
 (type $9 (func (param i32)))
 (import "env" "memory" (memory $0 1))
 (import "env" "Date.now" (func $~lib/bindings/dom/Date.now (result f64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 2352))
 (data $0 (i32.const 1036) "\1c\00\00\00\00\00\00\00\00\00\00\00\01\00\00\00\t\00\00\00Butterfly\00\00\00")
 (data $1 (i32.const 1068) ",\00\00\00\00\00\00\00\00\00\00\00\04\00\00\00\10\00\00\00 \04\00\00 \04\00\00\t\00\00\00\t\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data $2 (i32.const 1116) "\8c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00r\00\00\00i\00u\00u\00q\00t\00;\000\000\00x\00f\00c\00i\00p\00p\00l\00/\00t\00j\00u\00f\000\001\00c\002\00d\005\006\00c\008\00.\002\00b\00g\008\00.\005\009\003\009\00.\00c\004\005\006\00.\00c\005\006\00:\003\008\007\00e\00g\00f\00b\006\00\00\00\00\00\00\00\00\00\00\00")
 (data $3 (i32.const 1260) "|\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00d\00\00\00t\00o\00S\00t\00r\00i\00n\00g\00(\00)\00 \00r\00a\00d\00i\00x\00 \00a\00r\00g\00u\00m\00e\00n\00t\00 \00m\00u\00s\00t\00 \00b\00e\00 \00b\00e\00t\00w\00e\00e\00n\00 \002\00 \00a\00n\00d\00 \003\006\00\00\00\00\00\00\00\00\00")
 (data $4 (i32.const 1388) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00&\00\00\00~\00l\00i\00b\00/\00u\00t\00i\00l\00/\00n\00u\00m\00b\00e\00r\00.\00t\00s\00\00\00\00\00\00\00")
 (data $5 (i32.const 1452) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\02\00\00\000\00\00\00\00\00\00\00\00\00\00\00")
 (data $6 (i32.const 1484) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e\00\00\00\00\00")
 (data $7 (i32.const 1548) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data $8 (i32.const 1612) "\\\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00H\00\00\000\001\002\003\004\005\006\007\008\009\00a\00b\00c\00d\00e\00f\00g\00h\00i\00j\00k\00l\00m\00n\00o\00p\00q\00r\00s\00t\00u\00v\00w\00x\00y\00z\00\00\00\00\00")
 (data $9 (i32.const 1708) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\02\00\00\00_\00\00\00\00\00\00\00\00\00\00\00")
 (data $10 (i32.const 1740) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data $11 (i32.const 1772) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e\00\00\00\00\00\00\00\00\00")
 (data $12 (i32.const 1836) ",\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s\00\00\00")
 (data $13 (i32.const 1884) ",\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\10\00\00\00h\00t\00t\00p\00s\00:\00/\00/\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data $14 (i32.const 1932) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00$\00\00\00U\00n\00p\00a\00i\00r\00e\00d\00 \00s\00u\00r\00r\00o\00g\00a\00t\00e\00\00\00\00\00\00\00\00\00")
 (data $15 (i32.const 1996) ",\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1c\00\00\00~\00l\00i\00b\00/\00s\00t\00r\00i\00n\00g\00.\00t\00s\00")
 (data $16 (i32.const 2044) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00$\00\00\00~\00l\00i\00b\00/\00t\00y\00p\00e\00d\00a\00r\00r\00a\00y\00.\00t\00s\00\00\00\00\00\00\00\00\00")
 (data $17 (i32.const 2108) ",\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h\00")
 (data $18 (i32.const 2156) "\9c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\80\00\00\00A\00B\00C\00D\00E\00F\00G\00H\00I\00J\00K\00L\00M\00N\00O\00P\00Q\00R\00S\00T\00U\00V\00W\00X\00Y\00Z\00a\00b\00c\00d\00e\00f\00g\00h\00i\00j\00k\00l\00m\00n\00o\00p\00q\00r\00s\00t\00u\00v\00w\00x\00y\00z\000\001\002\003\004\005\006\007\008\009\00+\00/\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (data $19 (i32.const 2316) "\1c\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\02\00\00\00=\00\00\00\00\00\00\00\00\00\00\00")
 (data $20 (i32.const 2352) "\06\00\00\00 \00\00\00 \00\00\00 \00\00\00\00\00\00\00B\00\00\00A\00\00\00")
 (export "generateTimestamp" (func $assembly/api/generateTimestamp))
 (export "encryptRequest" (func $assembly/api/encryptRequest))
 (export "prepareApiRequest" (func $assembly/api/prepareApiRequest))
 (export "getApiUrl" (func $assembly/api/getApiUrl))
 (export "encodePayload" (func $assembly/api/encodePayload))
 (export "__new" (func $~lib/rt/stub/__new))
 (export "__pin" (func $~lib/rt/stub/__pin))
 (export "__unpin" (func $~lib/rt/stub/__unpin))
 (export "__collect" (func $~lib/rt/stub/__collect))
 (export "__rtti_base" (global $~lib/rt/__rtti_base))
 (export "memory" (memory $0))
 (start $~start)
 (func $assembly/api/generateTimestamp (result i64)
  call $~lib/bindings/dom/Date.now
  i64.trunc_sat_f64_s
 )
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 1504
   i32.const 1568
   i32.const 86
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  local.tee $3
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 1504
   i32.const 1568
   i32.const 33
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.set $5
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.tee $2
  local.get $3
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.tee $6
  i32.add
  local.tee $3
  memory.size
  local.tee $4
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const -16
  i32.and
  local.tee $7
  i32.gt_u
  if
   local.get $4
   local.get $3
   local.get $7
   i32.sub
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $7
   local.get $4
   local.get $7
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $7
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $3
  global.set $~lib/rt/stub/offset
  local.get $5
  local.get $6
  i32.store
  local.get $2
  i32.const 4
  i32.sub
  local.tee $3
  i32.const 0
  i32.store offset=4
  local.get $3
  i32.const 0
  i32.store offset=8
  local.get $3
  local.get $1
  i32.store offset=12
  local.get $3
  local.get $0
  i32.store offset=16
  local.get $2
  i32.const 16
  i32.add
 )
 (func $~lib/util/number/itoa64 (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  i64.eqz
  if
   i32.const 1472
   return
  end
  i64.const 0
  local.get $0
  i64.sub
  local.get $0
  local.get $0
  i64.const 63
  i64.shr_u
  i32.wrap_i64
  i32.const 1
  i32.shl
  local.tee $2
  select
  local.tee $0
  i64.const 4294967295
  i64.le_u
  if
   local.get $0
   i32.wrap_i64
   local.tee $1
   i32.const 10
   i32.ge_u
   i32.const 1
   i32.add
   local.get $1
   i32.const 10000
   i32.ge_u
   i32.const 3
   i32.add
   local.get $1
   i32.const 1000
   i32.ge_u
   i32.add
   local.get $1
   i32.const 100
   i32.lt_u
   select
   local.get $1
   i32.const 1000000
   i32.ge_u
   i32.const 6
   i32.add
   local.get $1
   i32.const 1000000000
   i32.ge_u
   i32.const 8
   i32.add
   local.get $1
   i32.const 100000000
   i32.ge_u
   i32.add
   local.get $1
   i32.const 10000000
   i32.lt_u
   select
   local.get $1
   i32.const 100000
   i32.lt_u
   select
   local.tee $3
   i32.const 1
   i32.shl
   local.get $2
   i32.add
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $4
   local.get $2
   i32.add
   local.set $5
   loop $do-loop|0
    local.get $5
    local.get $3
    i32.const 1
    i32.sub
    local.tee $3
    i32.const 1
    i32.shl
    i32.add
    local.get $1
    i32.const 10
    i32.rem_u
    i32.const 48
    i32.add
    i32.store16
    local.get $1
    i32.const 10
    i32.div_u
    local.tee $1
    br_if $do-loop|0
   end
  else
   local.get $0
   i64.const 100000000000
   i64.ge_u
   i32.const 10
   i32.add
   local.get $0
   i64.const 10000000000
   i64.ge_u
   i32.add
   local.get $0
   i64.const 100000000000000
   i64.ge_u
   i32.const 13
   i32.add
   local.get $0
   i64.const 10000000000000
   i64.ge_u
   i32.add
   local.get $0
   i64.const 1000000000000
   i64.lt_u
   select
   local.get $0
   i64.const 10000000000000000
   i64.ge_u
   i32.const 16
   i32.add
   local.get $0
   i64.const -8446744073709551616
   i64.ge_u
   i32.const 18
   i32.add
   local.get $0
   i64.const 1000000000000000000
   i64.ge_u
   i32.add
   local.get $0
   i64.const 100000000000000000
   i64.lt_u
   select
   local.get $0
   i64.const 1000000000000000
   i64.lt_u
   select
   local.tee $1
   i32.const 1
   i32.shl
   local.get $2
   i32.add
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $4
   local.get $2
   i32.add
   local.set $3
   loop $do-loop|00
    local.get $3
    local.get $1
    i32.const 1
    i32.sub
    local.tee $1
    i32.const 1
    i32.shl
    i32.add
    local.get $0
    i64.const 10
    i64.rem_u
    i32.wrap_i64
    i32.const 48
    i32.add
    i32.store16
    local.get $0
    i64.const 10
    i64.div_u
    local.tee $0
    i64.const 0
    i64.ne
    br_if $do-loop|00
   end
  end
  local.get $2
  if
   local.get $4
   i32.const 45
   i32.store16
  end
  local.get $4
 )
 (func $~lib/string/String#get:length (param $0 i32) (result i32)
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
 )
 (func $~lib/string/String.__concat (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  i32.const 1760
  local.set $2
  local.get $0
  call $~lib/string/String#get:length
  i32.const 1
  i32.shl
  local.tee $3
  local.get $1
  call $~lib/string/String#get:length
  i32.const 1
  i32.shl
  local.tee $4
  i32.add
  local.tee $5
  if
   local.get $5
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $2
   local.get $0
   local.get $3
   memory.copy
   local.get $2
   local.get $3
   i32.add
   local.get $1
   local.get $4
   memory.copy
  end
  local.get $2
 )
 (func $~lib/string/String#charCodeAt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  call $~lib/string/String#get:length
  local.get $1
  i32.le_u
  if
   i32.const -1
   return
  end
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  i32.load16_u
 )
 (func $~lib/string/String.fromCharCode@varargs (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  block $1of1
   block $0of1
    block $outOfRange
     global.get $~argumentsLength
     i32.const 1
     i32.sub
     br_table $0of1 $1of1 $outOfRange
    end
    unreachable
   end
   i32.const -1
   local.set $1
  end
  i32.const 2
  local.get $1
  i32.const 0
  i32.gt_s
  local.tee $3
  i32.shl
  i32.const 2
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $0
  i32.store16
  local.get $3
  if
   local.get $2
   local.get $1
   i32.store16 offset=2
  end
  local.get $2
 )
 (func $assembly/api/encryptRequest (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  call $~lib/bindings/dom/Date.now
  i64.trunc_sat_f64_s
  call $~lib/util/number/itoa64
  local.set $1
  local.get $0
  i32.const 1728
  call $~lib/string/String.__concat
  local.get $1
  call $~lib/string/String.__concat
  local.set $2
  i32.const 1760
  local.set $1
  i32.const 0
  local.set $0
  loop $for-loop|0
   local.get $2
   call $~lib/string/String#get:length
   local.get $0
   i32.gt_s
   if
    local.get $2
    local.get $0
    call $~lib/string/String#charCodeAt
    local.set $3
    local.get $0
    i32.const 1100
    i32.load
    i32.rem_s
    local.tee $4
    i32.const 1100
    i32.load
    i32.ge_u
    if
     i32.const 1792
     i32.const 1856
     i32.const 114
     i32.const 42
     call $~lib/builtins/abort
     unreachable
    end
    local.get $3
    local.get $4
    i32.const 1092
    i32.load
    i32.add
    i32.load8_u
    i32.xor
    local.set $3
    i32.const 1
    global.set $~argumentsLength
    local.get $1
    local.get $3
    call $~lib/string/String.fromCharCode@varargs
    call $~lib/string/String.__concat
    local.set $1
    local.get $0
    i32.const 1
    i32.add
    local.set $0
    br $for-loop|0
   end
  end
  local.get $1
 )
 (func $~lib/string/String#startsWith (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  call $~lib/string/String#get:length
  local.tee $1
  i32.const 0
  local.get $1
  i32.const 0
  i32.le_s
  select
  local.set $2
  local.get $1
  local.get $2
  i32.const 1904
  call $~lib/string/String#get:length
  local.tee $1
  i32.add
  i32.lt_s
  if
   i32.const 0
   return
  end
  local.get $0
  local.get $2
  i32.const 1
  i32.shl
  i32.add
  local.set $2
  i32.const 1904
  local.set $3
  block $__inlined_func$~lib/util/string/compareImpl$20
   loop $while-continue|0
    local.get $1
    local.tee $0
    i32.const 1
    i32.sub
    local.set $1
    local.get $0
    if
     local.get $2
     i32.load16_u
     local.tee $4
     local.get $3
     i32.load16_u
     local.tee $5
     i32.sub
     local.set $0
     local.get $4
     local.get $5
     i32.ne
     br_if $__inlined_func$~lib/util/string/compareImpl$20
     local.get $2
     i32.const 2
     i32.add
     local.set $2
     local.get $3
     i32.const 2
     i32.add
     local.set $3
     br $while-continue|0
    end
   end
   i32.const 0
   local.set $0
  end
  local.get $0
  i32.eqz
 )
 (func $assembly/api/prepareApiRequest (param $0 i32) (result i32)
  local.get $0
  call $~lib/string/String#startsWith
  i32.eqz
  if
   i32.const 1760
   return
  end
  local.get $0
  call $assembly/api/encryptRequest
 )
 (func $assembly/api/getApiUrl (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  i32.const 1760
  local.set $0
  loop $for-loop|0
   i32.const 1136
   call $~lib/string/String#get:length
   local.get $1
   i32.gt_s
   if
    i32.const 1136
    local.get $1
    call $~lib/string/String#charCodeAt
    i32.const 1
    i32.sub
    local.set $2
    i32.const 1
    global.set $~argumentsLength
    local.get $0
    local.get $2
    call $~lib/string/String.fromCharCode@varargs
    call $~lib/string/String.__concat
    local.set $0
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  local.get $0
  call $~lib/string/String#startsWith
  i32.eqz
  if
   i32.const 1760
   return
  end
  local.get $0
 )
 (func $~lib/string/String.UTF8.encodeUnsafe (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  local.set $3
  local.get $2
  local.set $1
  loop $while-continue|0
   local.get $0
   local.get $3
   i32.lt_u
   if
    local.get $0
    i32.load16_u
    local.tee $2
    i32.const 128
    i32.lt_u
    if (result i32)
     local.get $1
     local.get $2
     i32.store8
     local.get $1
     i32.const 1
     i32.add
    else
     local.get $2
     i32.const 2048
     i32.lt_u
     if (result i32)
      local.get $1
      local.get $2
      i32.const 6
      i32.shr_u
      i32.const 192
      i32.or
      local.get $2
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.const 8
      i32.shl
      i32.or
      i32.store16
      local.get $1
      i32.const 2
      i32.add
     else
      local.get $2
      i32.const 56320
      i32.lt_u
      local.get $0
      i32.const 2
      i32.add
      local.get $3
      i32.lt_u
      i32.and
      local.get $2
      i32.const 63488
      i32.and
      i32.const 55296
      i32.eq
      i32.and
      if
       local.get $0
       i32.load16_u offset=2
       local.tee $4
       i32.const 64512
       i32.and
       i32.const 56320
       i32.eq
       if
        local.get $1
        local.get $2
        i32.const 1023
        i32.and
        i32.const 10
        i32.shl
        i32.const 65536
        i32.add
        local.get $4
        i32.const 1023
        i32.and
        i32.or
        local.tee $2
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 24
        i32.shl
        local.get $2
        i32.const 6
        i32.shr_u
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 16
        i32.shl
        i32.or
        local.get $2
        i32.const 12
        i32.shr_u
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 8
        i32.shl
        i32.or
        local.get $2
        i32.const 18
        i32.shr_u
        i32.const 240
        i32.or
        i32.or
        i32.store
        local.get $1
        i32.const 4
        i32.add
        local.set $1
        local.get $0
        i32.const 4
        i32.add
        local.set $0
        br $while-continue|0
       end
      end
      local.get $1
      local.get $2
      i32.const 12
      i32.shr_u
      i32.const 224
      i32.or
      local.get $2
      i32.const 6
      i32.shr_u
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.const 8
      i32.shl
      i32.or
      i32.store16
      local.get $1
      local.get $2
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.store8 offset=2
      local.get $1
      i32.const 3
      i32.add
     end
    end
    local.set $1
    local.get $0
    i32.const 2
    i32.add
    local.set $0
    br $while-continue|0
   end
  end
 )
 (func $~lib/typedarray/Uint8Array#__get (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.load offset=8
  i32.ge_u
  if
   i32.const 1792
   i32.const 2064
   i32.const 167
   i32.const 45
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.add
  i32.load8_u
 )
 (func $~lib/as-base64/assembly/index/encode (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  i32.load offset=8
  local.get $0
  i32.load offset=8
  i32.const 3
  i32.rem_s
  local.tee $2
  i32.sub
  local.set $5
  local.get $0
  i32.load offset=8
  i32.const 3
  i32.div_s
  i32.const 2
  i32.shl
  i32.const 4
  i32.const 0
  local.get $2
  select
  i32.add
  i32.const 1
  i32.shl
  i32.const 2
  call $~lib/rt/stub/__new
  local.set $3
  local.get $0
  i32.load offset=8
  i32.eqz
  if
   i32.const 1760
   return
  end
  local.get $3
  i32.const 2
  i32.sub
  local.set $2
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.lt_s
   if
    local.get $2
    i32.const 2
    i32.add
    local.tee $2
    i32.const 2176
    local.get $0
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    i32.const 16
    i32.shl
    local.get $0
    local.get $1
    i32.const 1
    i32.add
    call $~lib/typedarray/Uint8Array#__get
    i32.const 8
    i32.shl
    i32.or
    local.get $0
    local.get $1
    i32.const 2
    i32.add
    call $~lib/typedarray/Uint8Array#__get
    i32.or
    local.tee $4
    i32.const 18
    i32.shr_u
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $2
    i32.const 2
    i32.add
    local.tee $2
    i32.const 2176
    local.get $4
    i32.const 12
    i32.shr_u
    i32.const 63
    i32.and
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $2
    i32.const 2
    i32.add
    local.tee $2
    i32.const 2176
    local.get $4
    i32.const 6
    i32.shr_u
    i32.const 63
    i32.and
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $2
    i32.const 2
    i32.add
    local.tee $2
    i32.const 2176
    local.get $4
    i32.const 63
    i32.and
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $1
    i32.const 3
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  block $break|1
   block $case1|1
    local.get $0
    i32.load offset=8
    local.get $5
    i32.sub
    local.tee $4
    i32.const 1
    i32.ne
    if
     local.get $4
     i32.const 2
     i32.eq
     br_if $case1|1
     br $break|1
    end
    local.get $2
    i32.const 2
    i32.add
    local.tee $2
    i32.const 2176
    local.get $0
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    i32.const 16
    i32.shl
    local.tee $0
    i32.const 18
    i32.shr_u
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $2
    i32.const 2
    i32.add
    local.tee $1
    i32.const 2176
    local.get $0
    i32.const 12
    i32.shr_u
    i32.const 63
    i32.and
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $1
    i32.const 2
    i32.add
    local.tee $0
    i32.const 2336
    i32.const 0
    call $~lib/string/String#charCodeAt
    i32.store16
    local.get $0
    i32.const 2336
    i32.const 0
    call $~lib/string/String#charCodeAt
    i32.store16 offset=2
    br $break|1
   end
   local.get $2
   i32.const 2
   i32.add
   local.tee $2
   i32.const 2176
   local.get $0
   local.get $1
   call $~lib/typedarray/Uint8Array#__get
   i32.const 16
   i32.shl
   local.get $0
   local.get $1
   i32.const 1
   i32.add
   call $~lib/typedarray/Uint8Array#__get
   i32.const 8
   i32.shl
   i32.or
   local.tee $0
   i32.const 18
   i32.shr_u
   call $~lib/string/String#charCodeAt
   i32.store16
   local.get $2
   i32.const 2
   i32.add
   local.tee $1
   i32.const 2176
   local.get $0
   i32.const 12
   i32.shr_u
   i32.const 63
   i32.and
   call $~lib/string/String#charCodeAt
   i32.store16
   local.get $1
   i32.const 2
   i32.add
   local.tee $1
   i32.const 2176
   local.get $0
   i32.const 6
   i32.shr_u
   i32.const 63
   i32.and
   call $~lib/string/String#charCodeAt
   i32.store16
   local.get $1
   i32.const 2336
   i32.const 0
   call $~lib/string/String#charCodeAt
   i32.store16 offset=2
  end
  local.get $3
 )
 (func $assembly/api/encodePayload (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  local.tee $1
  i32.const 20
  i32.sub
  i32.load offset=16
  local.get $1
  i32.add
  local.set $3
  loop $while-continue|0
   local.get $1
   local.get $3
   i32.lt_u
   if
    local.get $1
    i32.load16_u
    local.tee $4
    i32.const 128
    i32.lt_u
    if (result i32)
     local.get $2
     i32.const 1
     i32.add
    else
     local.get $4
     i32.const 2048
     i32.lt_u
     if (result i32)
      local.get $2
      i32.const 2
      i32.add
     else
      local.get $4
      i32.const 64512
      i32.and
      i32.const 55296
      i32.eq
      local.get $1
      i32.const 2
      i32.add
      local.get $3
      i32.lt_u
      i32.and
      if
       local.get $1
       i32.load16_u offset=2
       i32.const 64512
       i32.and
       i32.const 56320
       i32.eq
       if
        local.get $2
        i32.const 4
        i32.add
        local.set $2
        local.get $1
        i32.const 4
        i32.add
        local.set $1
        br $while-continue|0
       end
      end
      local.get $2
      i32.const 3
      i32.add
     end
    end
    local.set $2
    local.get $1
    i32.const 2
    i32.add
    local.set $1
    br $while-continue|0
   end
  end
  local.get $2
  i32.const 1
  call $~lib/rt/stub/__new
  local.set $1
  local.get $0
  local.get $0
  call $~lib/string/String#get:length
  local.get $1
  call $~lib/string/String.UTF8.encodeUnsafe
  i32.const 1
  global.set $~argumentsLength
  local.get $1
  i32.const 20
  i32.sub
  i32.load offset=16
  local.set $0
  i32.const 12
  i32.const 5
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $1
  i32.store
  local.get $2
  local.get $0
  i32.store offset=8
  local.get $2
  local.get $1
  i32.store offset=4
  local.get $2
  call $~lib/as-base64/assembly/index/encode
 )
 (func $~lib/rt/stub/__pin (param $0 i32) (result i32)
  local.get $0
 )
 (func $~lib/rt/stub/__unpin (param $0 i32)
 )
 (func $~lib/rt/stub/__collect
 )
 (func $~start
  i32.const 2380
  global.set $~lib/rt/stub/offset
 )
)
