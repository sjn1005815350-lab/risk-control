const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

let selectedCalculationCurrency='CNY';
const securityOptions={single:[['ALL','全部标的'],['证券1','证券1'],['证券2','证券2'],['证券3','证券3']],pool:[['ALL','全部证券池'],['证券1,证券2','证券池甲（证券1、2）'],['证券3','证券池乙（证券3）']],exchange:[['ALL','全部交易所'],['证券1,证券2','交易所甲（示例）'],['证券3','交易所乙（示例）']],contract:[['ALL','全部合约品种'],['证券1,证券3','合约品种甲（示例）'],['证券2','合约品种乙（示例）']]};
function updateSecurityOptions(prefix){const dimension=$('#'+prefix+'SecurityDimension').value,target=$(prefix==='trigger'?'#triggerSecurities':'#statisticsSecurities');target.innerHTML=securityOptions[dimension].map(([value,label],i)=>'<label><input type="checkbox" value="'+value+'"'+(i===0?' checked':'')+'> '+label+'</label>').join('')}
updateSecurityOptions('trigger');
$('#triggerSecurityDimension').addEventListener('change',()=>updateSecurityOptions('trigger'));



const holdings=[];
for(const [customer,values,assets] of [['A',[180,170,80],500],['B',[90,40,120],400],['C',[60,80,50],300]]) values.forEach((v,i)=>['渠道甲','渠道乙'].forEach((channel,j)=>holdings.push({客户:customer+'客户',证券:'证券'+(i+1),发行人:i===2?'发行人乙':'发行人甲',行业:i===2?'消费':'科技',策略:i===1?'策略乙':'策略甲',对冲渠道:channel,value:v*(j===0?.6:.4),assets,customer})));
function render(){const netOption=$('#aggregation option[value="net"]');netOption.disabled=$('#positionSide').value!=='gross';if(netOption.disabled&&$('#aggregation').value==='net')$('#aggregation').value='sum';const type=$('#ruleType').value,scope=$$('#scopeObject input:checked').map(x=>x.value),single=$('#state').value==='本次单笔委托',dims=single?[]:$$('[data-groupdim]:checked').map(x=>x.value),ag=single?'single':$('#aggregation').value,limit=Number($('#threshold')?.value??30);$('#groupingSection').hidden=single;$('#positionSideField').hidden=single;$('#positionSideField').style.display=single?'none':'flex';$('#aggregationField').style.display=single?'none':'flex';const direction=$('#sampleDirection').value,side=ag==='net'?'net':$('#positionSide').value;$('#positionSide').disabled=false;const source=single?[{客户:'A客户',证券:'证券1',发行人:'发行人甲',行业:'科技',策略:'策略甲',对冲渠道:'渠道甲',value:20,assets:500,customer:'A'}]:holdings.map(r=>{let long=r.value*.7,short=r.value*.3;const match=r.customer==='A'&&r.证券==='证券1'&&r.对冲渠道==='渠道甲';if(match){if(direction==='buyOpen')long+=20;if(direction==='sellOpen')short+=20;if(direction==='buyClose')short-=20;if(direction==='sellClose')long-=20}return {...r,value:side==='long'?long:side==='short'?short:side==='net'?long-short:long+short}});$('#positionEffect').textContent=single?'单笔值：20万元，不按持仓多空分类，也不聚合。':`示例初始多头75.6万元、空头32.4万元；${$('#sampleDirection').selectedOptions[0].text}20万元。按预计成交后的持仓计算，平仓按减少计入；多空净额保留正负号。${ag==='net'?'当前选择全部方向，NET按多头减空头计算。':''}`;const channels=$$('#channelScope input:checked').map(x=>x.value);const data=source.filter(r=>(scope.includes('ALL')||scope.includes(r.customer))&&(channels.length===0||channels.includes(r.对冲渠道))),groups=new Map();for(const r of data){const key=JSON.stringify(dims.map(d=>r[d]));if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
const quantity=$('#metric').value==='数量',unit=quantity?'股（示例）':'万元';$('#priceBasisField').style.display=quantity||single?'none':'flex';const rows=[...groups.values()].map(rs=>{const values=rs.map(r=>quantity?r.value*100:r.value),v=ag==='max'?Math.max(...values):values.reduce((a,b)=>a+b,0),assets=[...new Map(rs.map(r=>[r.customer,r.assets])).values()].reduce((a,b)=>a+b,0);return {label:single?'本次单笔委托（A客户 / 证券1）':dims.length?dims.map(d=>rs[0][d]).join(' × '):'所选客户 × 全部标的（合计）',v,d:assets,count:rs.length}});
const dim={customer:'客户',fund:'资金账号',framework:'框架'}[$('#scopeDimension').value];$('#scopeNote').textContent='控制范围决定纳入哪些对象；分别或合并计算统一在“分组维度”设置。';$('#groupExplain').textContent=`${dims.length?'按 '+dims.join('＋')+' 分别计算':'不分组，全部合并计算'}。未选择的维度在组内汇总；对冲渠道未选则合并、选中则分别计算。`;

if($('#typeConfig').dataset.type!==type+unit){$('#typeConfig').dataset.type=type+unit;$('#typeConfig').innerHTML=type==='absolute'?'<label>控制阈值（'+unit+'）<input id="absoluteLimit" type="number" min="0" value="300"></label>':type==='boolean'?'<label>布尔判断<select id="boolTarget"><option value="true">命中控制范围 = 是</option><option value="false">命中控制范围 = 否</option></select></label>':'<label>比例分母<select id="denominator"><option>对应客户净资产</option><option>对应账户总资产</option><option>额度上限</option><option>持仓总名本</option></select></label><label>控制阈值（%）<input id="threshold" type="number" min="0" max="100" step="0.1" value="30"></label>'
}
if(!quantity&&type!=='boolean'&&!$('#calculationCurrency')){const field=document.createElement('label');field.textContent='计算币种';const select=document.createElement('select');select.id='calculationCurrency';for(const [value,text] of [['CNY','人民币（CNY）'],['HKD','港币（HKD）'],['USD','美元（USD）']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.appendChild(option)}select.value=selectedCalculationCurrency;field.appendChild(select);$('#typeConfig').appendChild(field)}
const currency=(!quantity&&type!=='boolean')?$('#calculationCurrency').value:null;if(currency)selectedCalculationCurrency=currency;
const currencyNote=currency?' · 计算币种：'+currency:'';
const threshold=type==='absolute'?Number($('#absoluteLimit').value):type==='ratio'?Number($('#threshold').value):limit,expr=type==='ratio'?`聚合值 ÷ ${$('#denominator').value} ≤ ${threshold}%${currencyNote}（分子、分母须统一币种）`:type==='absolute'?`聚合值 ≤ ${threshold}${unit}${currencyNote}`:'存在持仓 = '+($('#boolTarget').value==='true'?'是':'否');
$('#formula').textContent=`控制范围：${dim} / ${scope.includes('ALL')?'全部客户':scope.map(c=>c+'客户').join('、')||'未选择对象'}\n生效时间：${$('#startDate').value||'未设置'} 至 ${$('#endDate').value||'未设置'} · ${$('#timeRange').value}\n控制范围（交易）：${$('#market').value} · ${$$('#behavior input:checked').map(x=>x.value).join('、')||'未选择交易方向'} · ${$('#triggerSecurityDimension').selectedOptions[0].text} / ${$$('#triggerSecurities input:checked').map(o=>o.parentElement.textContent.trim()).join('、')||'未选择'} · ${$('#orderMode').value}\n渠道范围：${$$('#channelScope input:checked').map(x=>x.value).join('、')||'所有渠道（未填写）'}\n分组维度：${single?'单笔委托，无需分组':dims.join('＋')||'不分组（全部汇总）'}\n聚合参数：${$('#state').value} · ${$('#metric').value}${quantity?'':single?' · 参考价格：委托价格':' · 参考价格：'+$('#priceBasis').value} · ${single?'单笔值（不聚合）':$('#positionSide').selectedOptions[0].text+' · '+$('#aggregation').selectedOptions[0].text} · ${$('#window').value}\n判断类型：${$('#ruleType').selectedOptions[0].text}\n公式：${expr}\n动作：${$('#action').value}`
;const pendingCurrency=currency&&currency!=='CNY';let failures=0;$('#resultTable').innerHTML='<table><thead><tr><th>检查单元</th><th>聚合值</th><th>判断值</th><th>结果</th></tr></thead><tbody>'+rows.map(r=>{const value=type==='ratio'?r.v/r.d*100:type==='absolute'?r.v:r.count>0,pass=type==='boolean'?value===($('#boolTarget').value==='true'):value<=threshold;if(!pass)failures++;return `<tr><td>${r.label}</td><td>${r.v.toFixed(1)}${unit}${quantity?'':'（样例原币：CNY）'}</td><td>${pendingCurrency?'待接入汇率后计算':type==='ratio'?`${r.v.toFixed(1)} ÷ ${r.d} = ${value.toFixed(1)}%`:type==='absolute'?value.toFixed(1)+unit:value?'是':'否'}</td><td class="${pass?'ok':'over'}">${pendingCurrency?'待计算':pass?'通过':$('#action').value}</td></tr>`}).join('')+'</tbody></table>';$('#resultSummary').textContent=pendingCurrency?'已设置计算币种 '+currency+'；当前人民币示例尚未接入汇率，不作阈值判断':`${rows.length}个检查单元 · ${failures}个未通过`;$('#takeaway').textContent=quantity?'数量使用独立示例口径：按示例价格100元/股换算数量，单位为股。实际单位应随标的类型确定。':single?'本次仅检查一笔示例订单：A客户买入证券1，委托金额20万元。分组设置不参与计算；控制范围不匹配时跳过。':`当前生成 ${rows.length} 个检查单元。范围对象决定纳入哪些客户；勾选客户则逐客户检查，不勾选则跨客户汇总。对冲渠道同理。初始多空合计：A客户430万元、B客户250万元、C客户190万元；本次委托按开平方向影响A客户持仓。`;}
document.addEventListener('change',e=>{if(e.target.id==='calculationCurrency')selectedCalculationCurrency=e.target.value;const box=e.target.closest('#triggerSecurities');if(box&&e.target.matches('input[type="checkbox"]')&&e.target.checked){if(e.target.value==='ALL')box.querySelectorAll('input').forEach(x=>x.checked=x===e.target);else box.querySelector('input[value="ALL"]').checked=false}render()});document.addEventListener('input',render);$('#resetBtn').onclick=()=>location.reload();render();
const sceneNames=['所有客户：每客户、每标的分别计算','所有客户：每客户的全部标的汇总','所有客户：跨客户、每标的汇总','所有客户：全部客户及标的汇总','部分客户：每客户、每标的分别计算','部分客户：每客户的全部标的汇总','部分客户：跨客户、每标的汇总','部分客户：所选客户及标的汇总'];
$('#scenarios').innerHTML=sceneNames.map((n,i)=>'<button data-scene="'+i+'">'+(i+1)+' · '+n+'</button>').join('');$('#scenarios').onclick=e=>{const b=e.target.closest('[data-scene]');if(!b)return;const n=+b.dataset.scene,dims=[['客户','证券'],['客户'],['证券'],[]][n%4];$$('#scopeObject input').forEach(x=>x.checked=n<4?x.value==='ALL':['A','B'].includes(x.value));$$('[data-groupdim]').forEach(x=>x.checked=dims.includes(x.value));$('#metric').value='金额';$('#aggregation').value='sum';$('#ruleType').value='absolute';$('#state').value='当前持仓+本次委托';$('#positionSide').value='gross';setChannelScope('ALL');render()};
const docScenarioData={
 whitelist:[["白名单：指定客户×指定标的","指定客户仅允许交易指定标的"],["白名单：全部客户×指定标的","全部客户仅允许交易指定标的"],["白名单：全部客户×指定证券池","全部客户仅允许交易证券池内标的"],["白名单：全部客户×指定交易所","全部客户仅允许交易指定交易所标的"]],
 singleOrderQty:[["单笔委托数量：指定客户×指定标的","指定客户单笔委托数量限制"],["单笔委托数量：全部客户×指定标的","全部客户单笔委托数量限制"],["单笔委托数量：全部客户×指定证券池","全部客户证券池内单笔委托数量限制"],["单笔委托数量：指定客户×指定渠道","指定客户指定渠道单笔委托数量限制"]],
 ban:[
  ['禁止交易：指定客户×指定标的','限制指定客户不得交易指定标的'],
  ['禁止交易：全部客户×指定标的','限制全部客户不得交易指定标的'],
  ['禁止交易：全部客户×指定证券范围','限制全部客户不得交易指定证券范围'],
  ['禁止交易：所有客户×某一时段','限制所有客户在时间区间内不可交易'],
  ['禁止交易：所有客户×某一渠道','限制所有客户通过指定对冲渠道不可交易']
 ],
 maxBuy:[
  ['最大可买：所有渠道×指定标的分别控制','所有渠道下指定标的逐标的限制最大可买数量/金额'],
  ['最大可买：单一渠道×指定标的分别控制','单一渠道下指定标的逐标的限制最大可买数量/金额'],
  ['最大可买：所有渠道×指定范围合计','全部客户范围内对指定证券范围汇总限制'],
  ['最大可买：单一渠道×指定范围合计','单一渠道内对指定证券范围汇总限制'],
  ['最大可买：客户分别×指定范围汇总','按客户分别控制指定标的、证券池或市场范围']
 ],
 blacklist:[
  ['黑名单：指定客户×指定标的','指定客户不得交易指定黑名单标的'],
  ['黑名单：全部客户×指定标的','全部客户不得交易指定黑名单标的'],
  ['黑名单：全部客户×指定证券池','全部客户不得交易黑名单证券池内标的'],
  ['黑名单：全部客户×指定交易所','全部客户不得交易指定交易所标的'],
  ['黑名单：全部客户×指定时间段','全部客户在指定时间段不得交易黑名单标的'],
  ['黑名单：全部客户×指定渠道','全部客户通过指定对冲渠道不得交易黑名单标的']
 ]
};
function renderDocScenarioButtons(){
 const make=(list,type)=>list.map((x,i)=>`<button type="button" data-doc-type="${type}" data-doc-index="${i}">${x[0]}</button>`).join('');
 $('#banScenarios').innerHTML=make(docScenarioData.ban,'ban');
 $('#maxBuyScenarios').innerHTML=make(docScenarioData.maxBuy,'maxBuy');
 $('#blacklistScenarios').innerHTML=make(docScenarioData.blacklist,'blacklist');
 $('#whitelistScenarios').innerHTML=make(docScenarioData.whitelist,'whitelist');
 $('#singleOrderQtyScenarios').innerHTML=make(docScenarioData.singleOrderQty,'singleOrderQty');
}
function setScopeObjects(mode){
 $$(' #scopeObject input').forEach(x=>x.checked=false);
 const all=$('#scopeObject input[value="ALL"]');
 if(mode==='all'){all.checked=true}else{$('#scopeObject input[value="A"]').checked=true}
}
function setSecurityDimension(value, selectedValues){
 $('#triggerSecurityDimension').value=value;
 $('#triggerSecurityDimension').dispatchEvent(new Event('change',{bubbles:true}));
 const box=$('#triggerSecurities');
 box.querySelectorAll('input').forEach(x=>x.checked=selectedValues.includes(x.value));
 const all=box.querySelector('input[value="ALL"]');
 if(all)all.checked=selectedValues.includes('ALL');
}
function applyWhitelist(index){
 const item=docScenarioData.whitelist[index];$('#scopeDimension').value='customer';setScopeObjects(index===0?'specified':'all');setChannelScope('ALL');$('#market').value='全部市场';setSecurityDimension(index===2?'pool':index===3?'exchange':'single',index===2?['证券1,证券2']:index===3?['证券1,证券2']:['证券1']);$('#state').value='本次单笔委托';$('#ruleType').value='boolean';$('#action').value='拒绝委托';$('#orderMode').value='全部';$('#timeRange').value='00:00 - 23:59';$$('#behavior input').forEach(x=>x.checked=true);$('#docGap').textContent='已应用：'+item[1]+'。已填入客户、证券维度和允许名单对象；布尔判断表示“是否命中控制范围”。命中白名单为是，未命中为否。';render();$('#boolTarget').value='true';render();}
function applySingleOrderQty(index){const item=docScenarioData.singleOrderQty[index];$('#market').value='全部市场';$('#orderMode').value='全部';$('#window').value='实时';$('#scopeDimension').value='customer';setScopeObjects(index===0||index===3?'specified':'all');setSecurityDimension(index===2?'pool':'single',index===2?['证券1,证券2']:['证券1']);setChannelScope(index===3?'渠道甲':'ALL');$('#state').value='本次单笔委托';$('#metric').value='数量';$('#ruleType').value='absolute';$('#aggregation').value='sum';$('#action').value='拒绝委托';$('#timeRange').value='00:00 - 23:59';$$('#behavior input').forEach(x=>x.checked=true);$('#docGap').textContent='已应用：'+item[1]+'。本次单笔委托不显示分组和持仓口径；数量按单笔值直接比较控制阈值（示例300股）。';render();$('#absoluteLimit').value='300';render();}
function applyBlacklist(index){
 const item=docScenarioData.blacklist[index];setChannelScope(index===5?'渠道甲':'ALL');
 $('#scopeDimension').value='customer';
 setScopeObjects(index===0?'specified':'all');
 $('#state').value='本次单笔委托';$('#market').value='全部市场';$$('#behavior input').forEach(x=>x.checked=true);
 $('#ruleType').value='boolean';
 $('#action').value='拒绝委托';
 $('#orderMode').value='全部';
 $$('[data-groupdim]').forEach(x=>x.checked=false);
 $$('[data-doc-type]').forEach(x=>x.classList.remove('selected'));
 const button=$(`[data-doc-type="blacklist"][data-doc-index="${index}"]`);if(button)button.classList.add('selected');
 if(index===0||index===1){setSecurityDimension('single',['证券1'])}
 else if(index===2){setSecurityDimension('pool',['证券1,证券2'])}
 else if(index===3){setSecurityDimension('exchange',['证券1,证券2'])}
 else {setSecurityDimension('single',['证券1'])}
 if(index===4){$('#timeRange').value='09:00 - 15:00'}else{$('#timeRange').value='00:00 - 23:59'}
 $('#docGap').textContent=`已设置：${item[1]}。${index===0?'范围对象已选 A 客户；证券维度已选“单标的”；证券对象已选“证券1”。':'已按场景设置客户范围、证券维度和证券对象；时间段或对冲渠道场景使用现有字段进行映射。'}`;
 render();$('#boolTarget').value='false';render();if(index===5)$('#docGap').textContent='已设置：全部客户、证券1、对冲渠道甲；其他渠道不在本规则范围内。';
}
renderDocScenarioButtons();
document.addEventListener('click',e=>{const b=e.target.closest('[data-doc-type]');if(!b)return;const type=b.dataset.docType,index=Number(b.dataset.docIndex);setChannelScope(type==='ban'&&index===4||type==='maxBuy'&&(index===1||index===3)?'渠道甲':'ALL');if(type==='blacklist'){applyBlacklist(index);return}if(type==='whitelist'){applyWhitelist(index);return}if(type==='singleOrderQty'){applySingleOrderQty(index);return}
$('#scopeDimension').value='customer';setScopeObjects(type==='ban'&&index===0?'specified':'all');$('#market').value='全部市场';$('#orderMode').value='全部';$('#timeRange').value=type==='ban'&&index===3?'09:00 - 15:00':'00:00 - 23:59';$$('#behavior input').forEach(x=>x.checked=true);$$('[data-groupdim]').forEach(x=>x.checked=type==='maxBuy'&&(index<2?x.value==='证券':index===4?x.value==='客户':false));setSecurityDimension(type==='maxBuy'&&index>=2?'pool':'single',type==='maxBuy'&&index>=2?['证券1,证券2']:['证券1']);$('#state').value=type==='ban'?'本次单笔委托':'当前持仓+本次委托';$('#metric').value='金额';$('#ruleType').value=type==='ban'?'boolean':'absolute';$('#aggregation').value='sum';$('#positionSide').value='gross';$('#action').value='拒绝委托';render();if(type==='ban'){$('#boolTarget').value='false';render()}$('#docGap').textContent='已应用：'+docScenarioData[type][index][1]+(type==='ban'&&index===4||type==='maxBuy'&&(index===1||index===3)?'。已选中对冲渠道甲，渠道筛选与分组独立。':'。客户范围、证券维度及证券对象已实际设置。');});

function setChannelScope(value){document.querySelectorAll('#channelScope input').forEach(x=>x.checked=value!=='ALL'&&x.value===value)}
$('#channelScope').addEventListener('change',render);


